import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/job";

/**
 * Fetch published jobs for public /jobs page
 */
export async function getPublishedJobs(): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error) {
      // If table doesn't exist yet, return empty list without crashing
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
        console.warn("Jobs table does not exist in Supabase yet. Please run migration.");
        return [];
      }
      throw error;
    }

    return (data as Job[]) || [];
  } catch (err: any) {
    console.error("Error fetching published jobs:", err);
    return [];
  }
}

/**
 * Fetch all jobs for Admin Dashboard
 */
export async function getAllAdminJobs(): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
        console.warn("Jobs table does not exist in Supabase yet. Please run migration.");
        return [];
      }
      throw error;
    }

    return (data as Job[]) || [];
  } catch (err: any) {
    console.error("Error fetching admin jobs:", err);
    throw err;
  }
}
