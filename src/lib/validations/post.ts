import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  slug: z
    .string({ required_error: "Slug is required" })
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug cannot exceed 120 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  category: z
    .string({ required_error: "Category is required" })
    .trim()
    .min(1, "Category cannot be empty"),
  content: z
    .string({ required_error: "Content is required" })
    .trim()
    .min(10, "Article content must be at least 10 characters"),
  excerpt: z
    .string()
    .trim()
    .max(500, "Excerpt cannot exceed 500 characters")
    .optional()
    .nullable(),
  author: z
    .string()
    .trim()
    .max(100, "Author name cannot exceed 100 characters")
    .optional()
    .nullable(),
  tags: z
    .array(z.string().trim().max(50, "Tag cannot exceed 50 characters"))
    .max(20, "Maximum 20 tags permitted")
    .optional(),
  status: z
    .enum(["published", "draft", "scheduled"])
    .default("draft"),
  featured: z
    .boolean()
    .optional()
    .default(false),
  image: z
    .string()
    .trim()
    .refine(
      (val) => !val || val === "" || val.startsWith("/") || /^https?:\/\/.+/i.test(val),
      { message: "Cover image must be a valid HTTP(S) URL or relative path" }
    )
    .optional()
    .nullable(),
  seo_title: z
    .string()
    .trim()
    .max(100, "SEO Title cannot exceed 100 characters")
    .optional()
    .nullable(),
  seo_description: z
    .string()
    .trim()
    .max(200, "SEO Description cannot exceed 200 characters")
    .optional()
    .nullable(),
  seo_keywords: z
    .string()
    .trim()
    .max(300, "SEO Keywords cannot exceed 300 characters")
    .optional()
    .nullable(),
  publish_date: z
    .string()
    .optional()
    .nullable(),
});

export type PostFormValues = z.infer<typeof postSchema>;
