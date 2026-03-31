import { supabase } from "@/lib/supabase";
import type { Article } from "@/types/post";
import { safeQuery } from "@/lib/db";

// Remove content and heavy seo fields to speed up UI
const CARD_PROJECTION = "id, title, slug, excerpt, category, publish_date, image, views, status, featured, created_at";

export async function getPublishedPosts(
  cursor?: string | null, 
  limit: number = 10, 
  categoryFilter?: string | null, 
  tagFilter?: string | null, 
  search?: string | null
) {
  const now = new Date().toISOString();
  let query = supabase
    .from("posts")
    .select(CARD_PROJECTION)
    .eq("status", "published")
  if (cursor) {
    query = query.lt("publish_date", cursor);
  } else {
    query = query.lte("publish_date", now);
  }
  
  query = query.order("publish_date", { ascending: false }).limit(limit);

  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  // Tags filter is harder in Supabase if not a pure json/array field indexed properly, simplified for now
  
  // Range removed in favor of purely limit-based cursor pagination

  const { success, data } = await safeQuery<Article[]>(query);
  return success ? (data || []) : [];
}

export async function getFeaturedPosts() {
  const now = new Date().toISOString();
  const query = supabase
    .from("posts")
    .select(CARD_PROJECTION)
    .eq("status", "published")
    .eq("featured", true)
    .lte("publish_date", now)
    .order("publish_date", { ascending: false })
    .limit(3);

  const { success, data } = await safeQuery<Article[]>(query);
  return success ? (data || []) : [];
}

export async function getTrendingPosts(limit: number = 5) {
  const now = new Date().toISOString();
  const query = supabase
    .from("posts")
    .select(CARD_PROJECTION)
    .eq("status", "published")
    .lte("publish_date", now)
    .order("views", { ascending: false })
    .limit(limit);

  const { success, data } = await safeQuery<Article[]>(query);
  return success ? (data || []) : [];
}

export async function getPostBySlug(slug: string) {
  const now = new Date().toISOString();
  const SINGLE_PROJECTION = "id, title, slug, content, excerpt, category, publish_date, image, views, status, featured, seo_description, seo_title, seo_keywords, tags, created_at, readTime, author";
  const query = supabase
    .from("posts")
    .select(SINGLE_PROJECTION) 
    .eq("slug", slug)
    .eq("status", "published")
    .lte("publish_date", now)
    .maybeSingle();

  const { success, data } = await safeQuery<Article>(query);
  return success ? data : null;
}

export async function getRelatedPosts(category: string, currentId: string, limit: number = 3) {
  const now = new Date().toISOString();
  const query = supabase
    .from("posts")
    .select(CARD_PROJECTION)
    .eq("status", "published")
    .eq("category", category)
    .lte("publish_date", now)
    .neq("id", currentId)
    .limit(limit);

  const { success, data } = await safeQuery<Article[]>(query);
  return success ? (data || []) : [];
}
