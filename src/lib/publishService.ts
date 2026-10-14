import { supabase } from "./supabase";
import type { Article } from "@/types/post";

export interface PublishResult {
  success: boolean;
  message?: string;
  data?: any;
}

/* ======================
SLUG
====================== */

const slugify = (text: string) => {

  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

};

/* ======================
IMAGE COMPRESSION
====================== */

const compressImage = async (
  file: File
): Promise<File> => {

  return new Promise((resolve) => {

    if (file.size < 50000) {

      resolve(file);
      return;

    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (e) => {

      const img = new Image();

      img.src =
        e.target?.result as string;

      img.onload = () => {

        const canvas =
          document.createElement("canvas");

        const MAX = 1200;

        let w = img.width;
        let h = img.height;

        if (w > MAX) {

          h *= MAX / w;
          w = MAX;

        }

        canvas.width = w;
        canvas.height = h;

        const ctx =
          canvas.getContext("2d");

        ctx?.drawImage(
          img,
          0,
          0,
          w,
          h
        );

        canvas.toBlob(

          (blob) => {

            if (blob) {

              resolve(

                new File(

                  [blob],

                  Date.now() + ".webp",

                  { type: "image/webp" }

                )

              );

            } else {

              resolve(file);

            }

          },

          "image/webp",

          0.7

        );

      };

      img.onerror = () =>
        resolve(file);

    };

  });

};

/* ======================
IMAGE PIPELINE HARDENING
====================== */

const VALID_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const uploadImage = async (
  file: File,
  retries = 1
): Promise<string> => {

  if (!VALID_MIMES.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, WEBP, and GIF are allowed.`);
  }

  try {
      const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "webp";
      const cleanName = file.name.split(".")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase();
      // Ensure completely unique string preventing duplicate accidental overrides
      const safeUUID = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const fileName = `${safeUUID}-${cleanName.substring(0, 15)}.${ext}`;

      const { error } = await supabase.storage.from("Image").upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;
      const { data } = supabase.storage.from("Image").getPublicUrl(fileName);
      return data.publicUrl;

  } catch (error) {
      if (retries > 0) {
          console.warn("Storage upload failed, retrying...", error);
          await new Promise(r => setTimeout(r, 1000));
          return uploadImage(file, retries - 1);
      }
      console.error(error);
      throw new Error("Image upload failed completely after retries");
  }

};

/* ======================
PUBLISH POST
====================== */

export async function publishPost(

  postData: Partial<Article>,
  imageFile?: File | null,
  forcePublish = false

): Promise<PublishResult> {

  try {

    if (!postData.title?.trim())
      throw new Error(
        "Title required"
      );

    if (!postData.content?.trim())
      throw new Error(
        "Content required"
      );

    /* IMAGE */

    let imageUrl =
      postData.image || "";

    if (imageFile) {

      const optimized =
        await compressImage(
          imageFile
        );

      imageUrl =
        await uploadImage(
          optimized
        );

    }

    /* SLUG */

    const baseSlug =

      postData.slug ||

      slugify(
        postData.title
      );

    let finalSlug =
      baseSlug;

    let counter = 1;

    while (true) {

      const { data } =

        await supabase

          .from("posts")

          .select("id")

          .eq("slug", finalSlug)

          .maybeSingle();

      if (!data)
        break;

      finalSlug =
        `${baseSlug}-${counter++}`;

    }

    /* STATUS */

    const status =

      forcePublish
        ? "published"
        : postData.status ||
        "draft";

    /* INSERT */

    const insertData = {

      title:
        postData.title.trim(),

      slug:
        finalSlug,

      content:
        postData.content.trim(),

      excerpt:
        postData.excerpt || "",

      image:
        imageUrl || null,

      category:
        postData.category ||
        "General",

      status,

      featured:
        postData.featured ??
        false,

      views: 0,

      seo_description:
        postData.seo_description ||
        "",

      publish_date:

        status === "published"
          ? new Date().toISOString()
          : null,

      created_at:
        new Date().toISOString()

    };

    const { data, error } =

      await supabase

        .from("posts")

        .insert([insertData])

        .select()

        .single();

    if (error)
      throw error;

    return {

      success: true,
      message: "Post saved",
      data

    };

  }

  catch (err: any) {

    console.error(err);

    return {

      success: false,
      message: err.message

    };

  }

}

/* ======================
UPDATE POST
====================== */

export async function updateExistingPost(

  id: string,

  postData: Partial<Article>,

  imageFile?: File | null,

  forcePublish = false

): Promise<PublishResult> {

  try {

    let imageUrl =
      postData.image || "";

    /* IMAGE */

    if (imageFile) {

      const optimized =
        await compressImage(
          imageFile
        );

      imageUrl =
        await uploadImage(
          optimized
        );

    }

    /* STATUS */

    const status =

      forcePublish
        ? "published"
        : postData.status ||
        "draft";

    /* UPDATE */

    const updateData: any = {

      title: postData.title,

      slug: postData.slug,

      content: postData.content,

      excerpt: postData.excerpt,

      category: postData.category,

      status,

      featured: postData.featured,

      seo_description:
        postData.seo_description,

      publish_date:

        status === "published"
          ? new Date().toISOString()
          : postData.publish_date

    };

    if (imageUrl)
      updateData.image =
        imageUrl;

    /* CLEAN */

    Object.keys(updateData)

      .forEach(

        k =>

          updateData[k] === undefined

          && delete updateData[k]

      );

    /* UPDATE */

    const { data, error } =

      await supabase

        .from("posts")

        .update(updateData)

        .eq("id", id)

        .select()

        .single();

    if (error)
      throw error;

    return {

      success: true,
      message: "Post updated",
      data

    };

  }

  catch (err: any) {

    console.error(err);

    return {

      success: false,
      message: err.message

    };

  }

}