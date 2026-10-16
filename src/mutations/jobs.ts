import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/publishService";
import type { Job, JobInput, JobStatus } from "@/types/job";

export async function createJob(jobData: JobInput, imageFile?: File | null): Promise<Job> {
  let imageUrl = jobData.image_url || null;

  if (imageFile) {
    imageUrl = await uploadImage(imageFile);
  }

  const nowIso = new Date().toISOString();
  const insertPayload = {
    title: jobData.title.trim(),
    company_name: jobData.company_name.trim(),
    role: jobData.role.trim(),
    description: jobData.description.trim(),
    work_arrangement: jobData.work_arrangement,
    employment_type: jobData.employment_type,
    location: jobData.location?.trim() || null,
    image_url: imageUrl,
    application_url: jobData.application_url?.trim() || null,
    status: jobData.status,
    published_at: jobData.status === "published" ? nowIso : null,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error("Create job failed:", error);
    throw new Error(`Failed to create job: ${error.message}`);
  }

  return data as Job;
}

export async function updateJob(
  id: string,
  jobData: Partial<JobInput>,
  imageFile?: File | null
): Promise<Job> {
  let imageUrl = jobData.image_url;

  if (imageFile) {
    imageUrl = await uploadImage(imageFile);
  }

  const nowIso = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    updated_at: nowIso,
  };

  if (jobData.title !== undefined) updatePayload.title = jobData.title.trim();
  if (jobData.company_name !== undefined) updatePayload.company_name = jobData.company_name.trim();
  if (jobData.role !== undefined) updatePayload.role = jobData.role.trim();
  if (jobData.description !== undefined) updatePayload.description = jobData.description.trim();
  if (jobData.work_arrangement !== undefined) updatePayload.work_arrangement = jobData.work_arrangement;
  if (jobData.employment_type !== undefined) updatePayload.employment_type = jobData.employment_type;
  if (jobData.location !== undefined) updatePayload.location = jobData.location?.trim() || null;
  if (imageUrl !== undefined) updatePayload.image_url = imageUrl;
  if (jobData.application_url !== undefined) updatePayload.application_url = jobData.application_url?.trim() || null;
  
  if (jobData.status !== undefined) {
    updatePayload.status = jobData.status;
    if (jobData.status === "published") {
      updatePayload.published_at = jobData.published_at || nowIso;
    }
  }

  const { data, error } = await supabase
    .from("jobs")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update job failed:", error);
    throw new Error(`Failed to update job: ${error.message}`);
  }

  return data as Job;
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) {
    console.error("Delete job failed:", error);
    throw new Error(`Failed to delete job: ${error.message}`);
  }
}

export async function toggleJobStatus(id: string, newStatus: JobStatus): Promise<Job> {
  const nowIso = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status: newStatus,
    updated_at: nowIso,
  };
  if (newStatus === "published") {
    updatePayload.published_at = nowIso;
  }

  const { data, error } = await supabase
    .from("jobs")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  return data as Job;
}
