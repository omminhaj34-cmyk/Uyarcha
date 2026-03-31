import { supabase } from "@/lib/supabase";
import type { Article } from "@/types/post";
import { safeQuery } from "@/lib/db";

const ADMIN_LIST_PROJECTION = "id, title, slug, image, category, status, views, publish_date, created_at";

export async function getAllAdminPosts(): Promise<Partial<Article>[]> {
  const query = supabase
    .from("posts")
    .select(ADMIN_LIST_PROJECTION)
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
     console.error("Admin Query Error:", error);
     throw new Error(error.message || "Failed to fetch admin posts");
  }
  return data || [];
}

export async function getPostContentForAdmin(id: string) {
    const query = supabase
      .from("posts")
      .select("content, excerpt, seo_title, seo_description, seo_keywords, tags")
      .eq("id", id)
      .maybeSingle();
    
    const { success, data } = await safeQuery<any>(query);
    return success ? data : null;
}
