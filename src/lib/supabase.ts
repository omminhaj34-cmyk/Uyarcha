import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ""
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

// Step 3 - REMOVE HARD CRASHES
export const isInvalid = !rawUrl || !rawKey || rawUrl === "PROJECT_URL" || rawKey === "ANON_KEY" || !rawUrl.startsWith('http');

if (isInvalid) {
  console.error("SUPABASE CONFIGURATION MISSING OR INVALID. Ensure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

// Use placeholders to prevent createClient from throwing during bootstrap
const safeUrl = isInvalid ? "https://placeholder-project.supabase.co" : rawUrl;
const safeKey = isInvalid ? "placeholder-key" : rawKey;

export const supabase = createClient(safeUrl, safeKey);

export const getImageUrl = (path: string | undefined, size?: "thumbnail" | "card" | "hero"): string => {
  if (!path) return ""
  
  // Custom absolute external URLs are returned directly
  if (typeof path === 'string' && path.startsWith("http")) {
    // Attempt optimization only if it's already a supabase URL internally pointing to our bucket
    if (path.includes("supabase.co") && path.includes("/object/public/")) {
       let dimensions = "";
        if (size === "thumbnail") dimensions = "?width=150&resize=contain&quality=70";
        else if (size === "card") dimensions = "?width=600&resize=contain&quality=75";
        else if (size === "hero") dimensions = "?width=1200&resize=cover&quality=80";
       
       if (dimensions) {
           return path.replace("/object/public/", "/render/image/public/") + dimensions;
       }
    }
    return path;
  }

  // If configuration is invalid, we can't get public URL
  if (isInvalid) return path || "";

  // Otherwise construct public URL from path
  const { data } = supabase.storage.from("Image").getPublicUrl(path);
  
  if (size) {
      let dimensions = "";
      if (size === "thumbnail") dimensions = "?width=150&resize=contain&quality=70";
      else if (size === "card") dimensions = "?width=600&resize=contain&quality=75";
      else if (size === "hero") dimensions = "?width=1200&resize=cover&quality=80";
      
      return data.publicUrl.replace("/object/public/", "/render/image/public/") + dimensions;
  }

  return data.publicUrl;
}