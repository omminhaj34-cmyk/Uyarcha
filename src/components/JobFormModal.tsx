import { useState, useEffect } from "react";
import { X, Save, Upload, Briefcase, Globe, AlertCircle, Building2, MapPin } from "lucide-react";
import type { Job, JobInput, WorkArrangement, EmploymentType, JobStatus } from "@/types/job";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSave: (data: JobInput, imageFile: File | null) => void;
  isSaving: boolean;
}

const suggestedRoles = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Data Analyst",
  "UI/UX Designer",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "Business Analyst",
  "Product Manager",
  "Engineering",
  "Product Design",
  "Other",
];

const JobFormModal = ({
  isOpen,
  onClose,
  job,
  onSave,
  isSaving,
}: JobFormModalProps) => {
  const [formData, setFormData] = useState<Partial<JobInput>>({
    title: "",
    company_name: "",
    role: "Full Stack Developer",
    description: "",
    work_arrangement: "Remote",
    employment_type: "Full-time",
    location: "",
    application_url: "",
    status: "published",
    image_url: "",
  });

  const [customRole, setCustomRole] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        company_name: job.company_name || "",
        role: job.role || "Full Stack Developer",
        description: job.description || "",
        work_arrangement: job.work_arrangement || "Remote",
        employment_type: job.employment_type || "Full-time",
        location: job.location || "",
        application_url: job.application_url || "",
        status: job.status || "published",
        image_url: job.image_url || "",
      });
      setCustomRole(!suggestedRoles.includes(job.role));
      setImagePreview(job.image_url || null);
    } else {
      setFormData({
        title: "",
        company_name: "",
        role: "Full Stack Developer",
        description: "",
        work_arrangement: "Remote",
        employment_type: "Full-time",
        location: "",
        application_url: "",
        status: "published",
        image_url: "",
      });
      setCustomRole(false);
      setImagePreview(null);
    }
    setImageFile(null);
    setErrorMessage(null);
  }, [job, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (targetStatus?: JobStatus) => {
    setErrorMessage(null);

    const title = formData.title?.trim() || "";
    if (!title) {
      setErrorMessage("Job title is required.");
      return;
    }

    const company_name = formData.company_name?.trim() || "";
    if (!company_name) {
      setErrorMessage("Company name is required.");
      return;
    }

    const role = formData.role?.trim() || "";
    if (!role) {
      setErrorMessage("Role / department is required.");
      return;
    }

    const description = formData.description?.trim() || "";
    if (!description) {
      setErrorMessage("Job description is required.");
      return;
    }

    let application_url = formData.application_url?.trim() || "";
    if (
      application_url &&
      !application_url.startsWith("http://") &&
      !application_url.startsWith("https://") &&
      !application_url.startsWith("mailto:")
    ) {
      application_url = `https://${application_url}`;
    }

    const finalStatus: JobStatus = targetStatus || formData.status || "published";

    const payload: JobInput = {
      title,
      company_name,
      role,
      description,
      work_arrangement: (formData.work_arrangement as WorkArrangement) || "Remote",
      employment_type: (formData.employment_type as EmploymentType) || "Full-time",
      location: formData.location?.trim() || null,
      application_url: application_url || null,
      status: finalStatus,
      image_url: formData.image_url || null,
    };

    onSave(payload, imageFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-background w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">
                {job ? "Edit Job Opportunity" : "Create New Job Opening"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure position details, requirements, and application link.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Job Title <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack Software Engineer"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Company Name <span className="text-accent">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Uyarcha Technologies"
                  value={formData.company_name || ""}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
                <Building2 className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Role / Department */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Role / Department <span className="text-accent">*</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomRole(!customRole)}
                className="text-xs text-accent hover:underline font-semibold"
              >
                {customRole ? "Choose from suggested list" : "+ Enter custom role"}
              </button>
            </div>

            {customRole ? (
              <input
                type="text"
                placeholder="e.g. Quantitative Developer, Solutions Architect"
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            ) : (
              <select
                value={formData.role || suggestedRoles[0]}
                onChange={(e) => {
                  if (e.target.value === "Other") {
                    setCustomRole(true);
                  } else {
                    setFormData({ ...formData, role: e.target.value });
                  }
                }}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {suggestedRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Work Arrangement & Employment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Work Arrangement <span className="text-accent">*</span>
              </label>
              <select
                value={formData.work_arrangement || "Remote"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    work_arrangement: e.target.value as WorkArrangement,
                  })
                }
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Employment Type <span className="text-accent">*</span>
              </label>
              <select
                value={formData.employment_type || "Full-time"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employment_type: e.target.value as EmploymentType,
                  })
                }
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Location & Application URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Location (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Kochi, Kerala, India or Remote"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <MapPin className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Application URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://company.com/apply or mailto:hr@co.com"
                  value={formData.application_url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, application_url: e.target.value })
                  }
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Globe className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Job Description & Responsibilities <span className="text-accent">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe the core responsibilities, key qualifications, engineering technologies, and requirements..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-card border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
              required
            />
          </div>

          {/* Image / Logo Upload */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Company Logo / Job Banner (Optional)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-16 h-16 rounded-xl border border-border overflow-hidden bg-muted shrink-0">
                  <img
                    src={imagePreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setFormData({ ...formData, image_url: "" });
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : null}

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary transition-colors">
                <Upload size={14} />
                <span>Upload Logo / Image</span>
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
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-border font-bold text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit("draft")}
              className="px-5 py-2.5 rounded-xl border border-border bg-secondary font-bold text-sm text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit("published")}
              className="px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:opacity-90 shadow-md shadow-accent/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{job ? "Update Job" : "Publish Job"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFormModal;
