export type WorkArrangement = "Remote" | "Hybrid" | "On-site";
export type EmploymentType = "Full-time" | "Part-time" | "Internship";
export type JobStatus = "draft" | "published";

export interface Job {
  id: string;
  title: string;
  company_name: string;
  role: string;
  description: string;
  work_arrangement: WorkArrangement;
  employment_type: EmploymentType;
  location?: string | null;
  image_url?: string | null;
  application_url?: string | null;
  status: JobStatus;
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export type JobInput = Omit<Job, "id" | "created_at" | "updated_at"> & {
  id?: string;
};
