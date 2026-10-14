export { publishPost, updateExistingPost } from "@/lib/publishService";
// In real structure, we move those files out of lib entirely to mutations/posts.ts
import { supabase } from "@/lib/supabase";

export async function deletePost(id: string) {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);
        
      if (error) {
        console.error("Supabase delete failed:", error);
        throw error;
      }
    } catch (err: any) {
        console.error("Delete error:", err);
        throw new Error(err.message || "Failed to delete post.");
    }
}
