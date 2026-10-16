import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublishedJobs, getAllAdminJobs } from "@/queries/jobs";
import { createJob, updateJob, deleteJob, toggleJobStatus } from "@/mutations/jobs";
import { toast } from "sonner";
import type { Job, JobInput, JobStatus } from "@/types/job";

export const usePublicJobs = () => {
  return useQuery<Job[]>({
    queryKey: ["public-jobs"],
    queryFn: getPublishedJobs,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdminJobs = (isLoggedIn = true) => {
  return useQuery<Job[]>({
    queryKey: ["admin-jobs"],
    queryFn: getAllAdminJobs,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveJob = (editingJob: Job | null, closeModal: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      imageFile,
    }: {
      data: JobInput;
      imageFile: File | null;
    }) => {
      if (editingJob && editingJob.id) {
        return await updateJob(editingJob.id, data, imageFile);
      } else {
        return await createJob(data, imageFile);
      }
    },
    onSuccess: (savedJob) => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["public-jobs"] });

      toast.success(
        editingJob
          ? "Job opportunity updated successfully!"
          : savedJob.status === "published"
          ? "Job opportunity published successfully!"
          : "Draft saved successfully!"
      );
      closeModal();
    },
    onError: (err: any) => {
      console.error("Save job error:", err);
      toast.error("Failed to save job", {
        description: err.message || "An unexpected error occurred.",
      });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["public-jobs"] });
      toast.success("Job deleted successfully.");
    },
    onError: (err: any) => {
      toast.error("Deletion failed", { description: err.message });
    },
  });
};

export const useToggleJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: JobStatus }) =>
      toggleJobStatus(id, newStatus),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["public-jobs"] });
      toast.success(
        job.status === "published" ? "Job published!" : "Job moved to drafts."
      );
    },
    onError: (err: any) => {
      toast.error("Status update failed", { description: err.message });
    },
  });
};
