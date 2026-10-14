import { supabase } from "@/lib/supabase";
import type { Certificate } from "@/types/certificate";
import { uploadImage } from "@/lib/publishService";

export async function saveCertificate(data: Partial<Certificate>, imageFile?: File | null) {
  try {
    if (!data.title?.trim()) throw new Error("Title required");
    if (!data.issuer?.trim()) throw new Error("Issuer required");

    let imageUrl = data.image || "";
    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
    }

    const payload: any = {
      title: data.title.trim(),
      issuer: data.issuer.trim(),
      description: data.description || "",
      verify_url: data.verify_url || "",
      issue_date: data.issue_date || null,
    };

    if (imageUrl) payload.image = imageUrl;

    const isUpdate = !!data.id;

    if (!isUpdate) {
        payload.created_at = new Date().toISOString();
        const { data: result, error } = await supabase.from("certificates").insert([payload]).select().single();
        if (error) throw error;
        return { success: true, data: result };
    } else {
        const { data: result, error } = await supabase.from("certificates").update(payload).eq("id", data.id).select().single();
        if (error) throw error;
        return { success: true, data: result };
    }

  } catch (err: any) {
    console.error("Certificate Save Error:", err);
    return { success: false, message: err.message };
  }
}

export async function deleteCertificate(id: string) {
    try {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
    } catch (err: any) {
        console.error("Delete error:", err);
        throw new Error(err.message || "Failed to delete certificate.");
    }
}
