import { useState } from "react";
import { toast } from "sonner";
import { Edit, Trash2, X, Save, Copy, PlusCircle } from "lucide-react";
import { getImageUrl } from "@/lib/supabase";
import type { Certificate } from "@/types/certificate";
import { useAdminCertificates, useSaveCertificate, useDeleteCertificate } from "@/hooks/useAdminCertificates";
import { getCertificateContentForAdmin } from "@/queries/getAdminCertificates";
import PageLoader from "@/components/PageLoader";
import ErrorFallback from "@/components/ErrorFallback";

const AdminCertificateTable = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
    const { data: certificates = [], isLoading, isError, refetch } = useAdminCertificates(isLoggedIn);
    const deleteMutation = useDeleteCertificate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCert, setEditingCert] = useState<Certificate | null>(null);
    const [formData, setFormData] = useState<Partial<Certificate>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCert(null);
        setFormData({});
        setImageFile(null);
        setImagePreview(null);
    };

    const saveMutation = useSaveCertificate(editingCert, closeModal);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({ data: formData, imageFile });
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("Permanently delete this certificate?")) return;
        deleteMutation.mutate(id);
    };

    const openModal = async (cert?: Certificate, duplicate = false) => {
        setIsModalOpen(true);
        if (cert) {
            const dataBase = duplicate ? { ...cert, id: undefined, title: cert.title + " (Copy)" } : cert;
            setFormData(dataBase);
            setEditingCert(duplicate ? null : cert);
            setImagePreview(getImageUrl(cert.image || ""));
            
            setIsLoadingContent(true);
            const fullCert = await getCertificateContentForAdmin(cert.id);
            setIsLoadingContent(false);
            
            if (fullCert) {
                 setFormData(prev => ({ ...prev, description: fullCert.description }));
            }
        } else {
            setEditingCert(null);
            setFormData({ title: "", issuer: "", description: "", verify_url: "", issue_date: new Date().toISOString().split("T")[0] });
            setImagePreview(null);
        }
    };

    if (isLoading) return <PageLoader message="Loading certificates..." />;
    if (isError) return <ErrorFallback message="Failed to load certificates." onRetry={refetch} />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Certificates Management</h2>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-bold hover:opacity-90 transition-all text-sm">
                    <PlusCircle size={16} /> New Certificate
                </button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider">Certificate</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider">Issuer</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider">Date</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {certificates.length === 0 ? (
                            <tr><td colSpan={4} className="p-20 text-center text-muted-foreground font-medium italic">No certificates yet. Add your first achievement!</td></tr>
                        ) : (
                            certificates.map((cert) => (
                                <tr key={cert.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <img src={getImageUrl(cert.image || "", "thumbnail") || "/placeholder.svg"} onError={(e)=>{(e.target as HTMLImageElement).src="/placeholder.svg"}} className="w-10 h-10 rounded-lg object-cover bg-muted" />
                                            <div className="font-bold text-sm line-clamp-1">{cert.title}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        {cert.issuer}
                                    </td>
                                    <td className="p-4 text-xs text-muted-foreground">
                                        {String(cert.issue_date || cert.created_at || "").split('T')[0]}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(cert, true)} className="p-2 hover:bg-muted rounded-lg" title="Duplicate"><Copy size={16} /></button>
                                            <button onClick={() => openModal(cert)} className="p-2 hover:bg-muted text-accent rounded-lg" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(cert.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-background w-full max-w-2xl max-h-[90vh] overflow-auto rounded-3xl shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
                            <h2 className="text-xl font-black">{editingCert ? "Edit Certificate" : "New Certificate"}</h2>
                            <button type="button" onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
                            {isLoadingContent && <div className="text-sm font-bold text-accent animate-pulse">Loading description...</div>}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Title</label>
                                    <input value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm font-bold" required />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Issuer</label>
                                    <input value={formData.issuer || ""} onChange={e => setFormData({...formData, issuer: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm font-bold" required />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Description</label>
                                    <textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm min-h-[100px]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Verify URL</label>
                                        <input value={formData.verify_url || ""} onChange={e => setFormData({...formData, verify_url: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm" type="url" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Issue Date</label>
                                        <input value={formData.issue_date || ""} onChange={e => setFormData({...formData, issue_date: e.target.value})} className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm" type="date" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Certificate Image</label>
                                    <div className="aspect-video bg-muted/30 border border-border rounded-xl mb-3 overflow-hidden">
                                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-xs">No image</div>}
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
                                        className="w-full text-xs"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-border mt-6 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-6 py-2 border rounded-xl font-bold text-sm">Cancel</button>
                                <button type="submit" disabled={saveMutation.isPending} className="px-8 py-2 bg-accent text-white rounded-xl font-black text-sm hover:opacity-90 flex items-center gap-2">
                                    {saveMutation.isPending ? "Saving..." : <><Save size={16}/> Save Certificate</>}
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
