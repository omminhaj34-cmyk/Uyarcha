import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  X,
  Save,
  Copy,
  PlusCircle,
  Search,
  Award,
  CheckCircle2,
  Tag,
  ExternalLink,
} from "lucide-react";
import { getImageUrl } from "@/lib/supabase";
import type { Certificate } from "@/types/certificate";
import {
  useAdminCertificates,
  useSaveCertificate,
  useDeleteCertificate,
} from "@/hooks/useAdminCertificates";
import { getCertificateContentForAdmin } from "@/queries/getAdminCertificates";
import PageLoader from "@/components/PageLoader";
import ErrorFallback from "@/components/ErrorFallback";
import { formatPrice, isValidPrice, DEFAULT_CURRENCY } from "@/lib/currency";

const AdminCertificateTable = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const {
    data: certificates = [],
    isLoading,
    isError,
    refetch,
  } = useAdminCertificates(isLoggedIn);
  const deleteMutation = useDeleteCertificate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState<Partial<Certificate>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all");

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
    setFormData({});
    setImageFile(null);
    setImagePreview(null);
    setIsLoadingContent(false);
  };

  const saveMutation = useSaveCertificate(editingCert, closeModal);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error("Certificate title is required.");
      return;
    }

    if (!formData.issuer?.trim()) {
      toast.error("Certificate issuer is required.");
      return;
    }

    const pricingType = formData.pricing_type || "free";

    if (pricingType === "paid") {
      if (!isValidPrice(formData.price)) {
        toast.error("Please enter a valid positive price greater than 0 for paid certificates.");
        return;
      }
    }

    saveMutation.mutate({
      data: {
        ...formData,
        pricing_type: pricingType,
        price: pricingType === "paid" ? Number(formData.price) : null,
        currency: formData.currency || DEFAULT_CURRENCY,
      },
      imageFile,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Permanently delete this certificate? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const openModal = async (cert?: Certificate, duplicate = false) => {
    setIsModalOpen(true);
    if (cert) {
      const dataBase = duplicate
        ? { ...cert, id: undefined, title: cert.title + " (Copy)" }
        : cert;

      setFormData({
        ...dataBase,
        pricing_type: cert.pricing_type || "free",
        price: cert.price ?? null,
        currency: cert.currency || DEFAULT_CURRENCY,
      });
      setEditingCert(duplicate ? null : cert);
      setImagePreview(getImageUrl(cert.image || ""));

      setIsLoadingContent(true);
      try {
        const fullCert = await getCertificateContentForAdmin(cert.id);
        if (fullCert) {
          setFormData((prev) => ({
            ...prev,
            description: fullCert.description ?? prev.description,
            pricing_type: fullCert.pricing_type ?? prev.pricing_type ?? "free",
            price: fullCert.price !== undefined ? fullCert.price : prev.price,
            currency: fullCert.currency ?? prev.currency ?? DEFAULT_CURRENCY,
          }));
        }
      } catch (err) {
        console.warn("Could not fetch extra certificate content:", err);
      } finally {
        setIsLoadingContent(false);
      }
    } else {
      setEditingCert(null);
      setFormData({
        title: "",
        issuer: "",
        description: "",
        verify_url: "",
        issue_date: new Date().toISOString().split("T")[0],
        pricing_type: "free",
        price: null,
        currency: DEFAULT_CURRENCY,
      });
      setImagePreview(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: certificates.length,
      free: certificates.filter((c) => (c.pricing_type || "free") === "free").length,
      paid: certificates.filter((c) => c.pricing_type === "paid").length,
    };
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      const matchesSearch =
        searchQuery === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.issuer && c.issuer.toLowerCase().includes(searchQuery.toLowerCase()));

      const certType = c.pricing_type || "free";
      const matchesFilter = filterType === "all" || certType === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [certificates, searchQuery, filterType]);

  if (isLoading) return <PageLoader message="Loading certificates..." />;
  if (isError) return <ErrorFallback message="Failed to load certificates." onRetry={refetch} />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Certificates Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage professional certificates, achievement badges, and pricing settings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold hover:opacity-90 transition-all text-sm shadow-md shadow-accent/25 shrink-0"
        >
          <PlusCircle size={18} />
          <span>New Certificate</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
              Total Certificates
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <Award size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All issued credentials</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
              Free Certificates
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.free}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Free access credentials</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between mb-2 text-muted-foreground">
            <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
              Paid Certificates
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Tag size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-violet-600 dark:text-violet-400">
              {stats.paid}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Premium certifications</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certificates by title or issuer..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Type:</span>
          {(["all", "free", "paid"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filterType === type
                  ? "bg-accent text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Certificate
                </th>
                <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Issuer
                </th>
                <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Type & Price
                </th>
                <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 px-6 text-center text-muted-foreground space-y-2">
                    <Award className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                    <p className="font-bold text-foreground">
                      {certificates.length === 0
                        ? "No certificates created yet."
                        : "No matching certificates found."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {certificates.length === 0
                        ? 'Click "New Certificate" above to issue your first achievement.'
                        : "Try adjusting your search query or type filter."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getImageUrl(cert.image || "", "thumbnail") || "/placeholder.svg"}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                          alt={cert.title}
                          className="w-12 h-8 rounded-md object-cover bg-muted shrink-0 border border-border/60"
                        />
                        <div>
                          <div className="font-bold text-sm text-foreground line-clamp-1">
                            {cert.title}
                          </div>
                          {cert.verify_url && (
                            <a
                              href={cert.verify_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>Verification link</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-xs font-semibold text-foreground/90">
                      {cert.issuer || "—"}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {cert.pricing_type === "paid" ? (
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-violet-50 text-violet-700 border border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40">
                            PAID
                          </span>
                          <span className="text-sm font-black text-foreground">
                            {formatPrice(cert.price, cert.currency || DEFAULT_CURRENCY)}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-muted-foreground whitespace-nowrap">
                      {String(cert.issue_date || cert.created_at || "").split("T")[0] || "—"}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(cert, true)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          title="Duplicate"
                          aria-label={`Duplicate ${cert.title}`}
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal(cert)}
                          className="p-2 text-muted-foreground hover:text-accent hover:bg-secondary rounded-lg transition-colors"
                          title="Edit"
                          aria-label={`Edit ${cert.title}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cert.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete"
                          aria-label={`Delete ${cert.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editingCert ? "Edit Certificate" : "New Certificate"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingCert
                    ? "Update credential details, pricing, and verification links."
                    : "Issue a new free or paid certification credential."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 flex-1">
              {isLoadingContent && (
                <div className="text-xs font-bold text-accent animate-pulse">
                  Loading certificate details...
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Certificate Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Python Programming Certificate"
                  className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {/* Issuer */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Issuer Organization <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.issuer || ""}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="e.g. Microsoft, Coursera, Uyarcha"
                  className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {/* Certificate Type & Dynamic Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Certificate Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.pricing_type || "free"}
                    onChange={(e) => {
                      const newType = e.target.value as "free" | "paid";
                      setFormData((prev) => ({
                        ...prev,
                        pricing_type: newType,
                        price: newType === "paid" ? prev.price ?? "" : null,
                      }));
                    }}
                    className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Free certificates do not require a price.
                  </p>
                </div>

                {formData.pricing_type === "paid" && (
                  <div className="animate-fade-in">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Price (₹) <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="e.g. 999"
                        value={formData.price ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            price: val === "" ? null : Number(val),
                          }));
                        }}
                        className="w-full bg-secondary/40 border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        required={formData.pricing_type === "paid"}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Must be a valid positive amount greater than 0.
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of skills learned, curriculum, or credentials provided..."
                  rows={3}
                  className="w-full bg-secondary/40 border border-border rounded-xl p-3.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Verify URL & Issue Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Verification URL
                  </label>
                  <input
                    type="url"
                    value={formData.verify_url || ""}
                    onChange={(e) => setFormData({ ...formData, verify_url: e.target.value })}
                    placeholder="https://example.com/verify/..."
                    className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date || ""}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Certificate Image */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Certificate Image
                </label>
                <div className="aspect-video max-h-48 bg-secondary/30 border border-border rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Certificate preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground text-xs gap-1.5 p-4 text-center">
                      <Award size={24} className="opacity-40" />
                      <span>No image uploaded</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80 cursor-pointer"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saveMutation.isPending}
                  className="px-5 py-2.5 rounded-xl border border-border font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:opacity-90 flex items-center gap-2 shadow-md shadow-accent/25 disabled:opacity-50 transition-all"
                >
                  {saveMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificateTable;
