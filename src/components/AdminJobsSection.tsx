import { useState, useMemo } from "react";
import { PlusCircle, Edit, Trash2, Briefcase, Eye, EyeOff, Building2, MapPin, Search, CheckCircle2, Clock, Globe } from "lucide-react";
import { useAdminJobs, useSaveJob, useDeleteJob, useToggleJobStatus } from "@/hooks/useJobs";
import JobFormModal from "@/components/JobFormModal";
import type { Job, JobInput } from "@/types/job";

const AdminJobsSection = () => {
  const { data: jobs = [], isLoading, isError } = useAdminJobs(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const saveMutation = useSaveJob(editingJob, closeModal);
  const deleteMutation = useDeleteJob();
  const toggleMutation = useToggleJobStatus();

  const handleOpenCreate = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Permanently delete this job opening? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (job: Job) => {
    const nextStatus = job.status === "published" ? "draft" : "published";
    toggleMutation.mutate({ id: job.id, newStatus: nextStatus });
  };

  const handleSaveForm = (data: JobInput, imageFile: File | null) => {
    saveMutation.mutate({ data, imageFile });
  };

  // Metrics computation
  const stats = useMemo(() => {
    return {
      total: jobs.length,
      published: jobs.filter((j) => j.status === "published").length,
      drafts: jobs.filter((j) => j.status === "draft").length,
      companies: new Set(jobs.map((j) => j.company_name?.toLowerCase().trim()).filter(Boolean)).size,
    };
  }, [jobs]);

  // Filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Jobs Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage job openings and publish opportunities for visitors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-sm hover:opacity-90 shadow-md shadow-accent/25 transition-all shrink-0"
        >
          <PlusCircle size={18} />
          <span>+ Create Job</span>
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
              Total Openings
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <Briefcase size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All career postings</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
              Published
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.published}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Live on public jobs page</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
              Drafts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.drafts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unpublished opportunities</p>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="font-bold uppercase text-[11px] tracking-wider text-muted-foreground">
              Hiring Companies
            </span>
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Building2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">{stats.companies}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique employers</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs by title, company, or role..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Status:</span>
          {(["all", "published", "draft"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === status
                  ? "bg-accent text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Job Title
                </th>
                <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Company
                </th>
                <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="py-4 px-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <span>Loading job opportunities...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-destructive font-medium">
                    Failed to fetch jobs. Make sure the database migration has been applied.
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 px-6 text-center text-muted-foreground space-y-2">
                    <Briefcase className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                    <p className="font-bold text-foreground">
                      {jobs.length === 0 ? "No jobs created yet." : "No matching jobs found."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {jobs.length === 0
                        ? 'Click "+ Create Job" above to publish your first career opportunity.'
                        : "Try adjusting your search query or status filter."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                    {/* JOB TITLE */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm sm:text-base text-foreground leading-snug">
                        {job.title}
                      </div>
                      {job.location && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="shrink-0" />
                          <span>{job.location}</span>
                        </div>
                      )}
                    </td>

                    {/* COMPANY */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground/90">
                        <Building2 size={14} className="text-accent shrink-0" />
                        <span>{job.company_name}</span>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                        {job.role}
                      </span>
                    </td>

                    {/* TYPE */}
                    <td className="py-4 px-5 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="font-semibold text-foreground">{job.employment_type}</div>
                      <div className="text-[11px] text-muted-foreground">{job.work_arrangement}</div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {job.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                          Draft
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Publish / Unpublish Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          title={job.status === "published" ? "Unpublish to Draft" : "Publish Job"}
                          aria-label={job.status === "published" ? "Unpublish to Draft" : "Publish Job"}
                        >
                          {job.status === "published" ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(job)}
                          className="p-2 text-muted-foreground hover:text-accent hover:bg-secondary rounded-lg transition-colors"
                          title="Edit Job"
                          aria-label={`Edit ${job.title}`}
                        >
                          <Edit size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(job.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete Job"
                          aria-label={`Delete ${job.title}`}
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

      {/* Modal for Create / Edit */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        job={editingJob}
        onSave={handleSaveForm}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
};

export default AdminJobsSection;
