import { supabase } from "./supabase";
import type { Article } from "@/types/post";

export interface PublishResult {
  success: boolean;
  message?: string;
  data?: any;
}

/* ======================
SLUG UTILITY
====================== */

export const slugify = (text: string): string => {
  const clean = (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || `post-${Date.now().toString(36)}`;
};

/* ======================
READ TIME UTILITY
====================== */

const calculateReadTime = (content: string): string => {
  const words = (content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

/* ======================
IMAGE COMPRESSION
====================== */

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // If under 100KB, no compression needed
    if (file.size < 100000) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1400;

        let w = img.width;
        let h = img.height;

        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(new File([blob], `${Date.now()}.webp`, { type: "image/webp" }));
            } else {
              resolve(file);
            }
          },
          "image/webp",
          0.8
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
};

/* ======================
IMAGE UPLOAD PIPELINE
====================== */

const VALID_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export const uploadImage = async (file: File, retries = 1): Promise<string> => {
  if (!VALID_MIMES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WEBP, GIF, SVG.`);
  }

  // 5MB limit check matching Supabase Storage bucket policy
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image file size exceeds the 5MB maximum limit.");
  }

  try {
    const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "webp";
    const cleanName = file.name.split(".")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const safeUUID = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    const fileName = `${safeUUID}-${cleanName.substring(0, 20)}.${ext}`;

    // Try 'Image' bucket first
    let uploadRes = await supabase.storage.from("Image").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    // Fallback to 'images' bucket if 'Image' fails with bucket not found
    if (uploadRes.error && uploadRes.error.message?.includes("Bucket not found")) {
      uploadRes = await supabase.storage.from("images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
    }

    if (uploadRes.error) {
      throw uploadRes.error;
    }

    const { data } = supabase.storage.from("Image").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error: any) {
    if (retries > 0) {
      console.warn("Storage upload retry...", error);
      await new Promise((r) => setTimeout(r, 1000));
      return uploadImage(file, retries - 1);
    }
    console.error("Image upload failed:", error);
    throw new Error(`Image upload failed: ${error.message || "Network or storage error"}`);
  }
};

/* ======================
PUBLISH POST
====================== */

export async function publishPost(
  postData: Partial<Article>,
  imageFile?: File | null
): Promise<PublishResult> {
  try {
    if (!postData.title?.trim()) {
      throw new Error("Article title is required.");
    }

    if (!postData.content?.trim()) {
      throw new Error("Article content is required.");
    }

    /* IMAGE HANDLING */
    let imageUrl = postData.image || "";
    if (imageFile) {
      const optimized = await compressImage(imageFile);
      imageUrl = await uploadImage(optimized);
    }

    /* SLUG GENERATION & UNIQUENESS CHECK */
    const baseSlug = slugify(postData.slug || postData.title || "article");
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data, error } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (error) {
        console.warn("Slug uniqueness check warning:", error);
        break;
      }

      if (!data) break; // Slug is unique
      finalSlug = `${baseSlug}-${counter++}`;
    }

    /* STATUS & PUBLISH DATE */
    const status = postData.status || "published";
    const nowIso = new Date().toISOString();
    
    let publishDate: string | null = null;
    if (status === "published") {
      publishDate = postData.publish_date || nowIso;
    } else if (status === "scheduled") {
      publishDate = postData.publish_date || nowIso;
    } else {
      // draft
      publishDate = postData.publish_date || null;
    }

    /* TAGS */
    const tags = Array.isArray(postData.tags)
      ? postData.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    /* CALCULATE READ TIME */
    const readTime = postData.readTime || calculateReadTime(postData.content);

    /* ASSEMBLE INSERT PAYLOAD */
    const insertData: Record<string, any> = {
      title: postData.title.trim(),
      slug: finalSlug,
      content: postData.content.trim(),
      excerpt: postData.excerpt?.trim() || "",
      image: imageUrl || null,
      category: postData.category || "General",
      tags: tags,
      status: status,
      featured: Boolean(postData.featured),
      author: postData.author || "Admin",
      readTime: readTime,
      seo_title: postData.seo_title?.trim() || null,
      seo_description: postData.seo_description?.trim() || "",
      seo_keywords: postData.seo_keywords?.trim() || null,
      views: 0,
      publish_date: publishDate,
      created_at: nowIso,
    };

    const { data, error } = await supabase
      .from("posts")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Supabase post insert failed:", error);
      throw new Error(`Database error: ${error.message} (Code: ${error.code || "UNKNOWN"})`);
    }

    return {
      success: true,
      message: "Post published successfully",
      data,
    };
  } catch (err: any) {
    console.error("publishPost error:", err);
    return {
      success: false,
      message: err.message || "Failed to publish post.",
    };
  }
}

/* ======================
UPDATE POST
====================== */

export async function updateExistingPost(
  id: string,
  postData: Partial<Article>,
  imageFile?: File | null
): Promise<PublishResult> {
  try {
    if (!id) {
      throw new Error("Post ID is required for update.");
    }

    let imageUrl = postData.image || "";

    /* IMAGE HANDLING */
    if (imageFile) {
      const optimized = await compressImage(imageFile);
      imageUrl = await uploadImage(optimized);
    }

    /* SLUG UNIQUENESS (excluding current post) */
    let finalSlug = slugify(postData.slug || postData.title || "article");
    let counter = 1;
    let testSlug = finalSlug;

    while (true) {
      const { data, error } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", testSlug)
        .neq("id", id)
        .maybeSingle();

      if (error || !data) {
        finalSlug = testSlug;
        break;
      }
      testSlug = `${finalSlug}-${counter++}`;
    }

    const status = postData.status || "published";
    const nowIso = new Date().toISOString();

    let publishDate: string | null = null;
    if (status === "published") {
      publishDate = postData.publish_date || nowIso;
    } else if (status === "scheduled") {
      publishDate = postData.publish_date || nowIso;
    } else {
      publishDate = postData.publish_date || null;
    }

    const tags = Array.isArray(postData.tags)
      ? postData.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const readTime = postData.readTime || (postData.content ? calculateReadTime(postData.content) : undefined);

    const updateData: Record<string, any> = {
      title: postData.title?.trim(),
      slug: finalSlug,
      content: postData.content?.trim(),
      excerpt: postData.excerpt?.trim() ?? "",
      category: postData.category,
      tags: tags,
      status: status,
      featured: Boolean(postData.featured),
      author: postData.author || "Admin",
      readTime: readTime,
      seo_title: postData.seo_title?.trim() || null,
      seo_description: postData.seo_description?.trim() || "",
      seo_keywords: postData.seo_keywords?.trim() || null,
      publish_date: publishDate,
    };

    if (imageUrl) {
      updateData.image = imageUrl;
    }

    // Clean undefined keys
    Object.keys(updateData).forEach((k) => {
      if (updateData[k] === undefined) {
        delete updateData[k];
      }
    });

    const { data, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase post update failed:", error);
      throw new Error(`Database error: ${error.message} (Code: ${error.code || "UNKNOWN"})`);
    }

    return {
      success: true,
      message: "Post updated successfully",
      data,
    };
  } catch (err: any) {
    console.error("updateExistingPost error:", err);
    return {
      success: false,
      message: err.message || "Failed to update post.",
    };
  }
}