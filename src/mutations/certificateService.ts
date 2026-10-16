import { supabase } from "@/lib/supabase";
import type { Certificate } from "@/types/certificate";
import { uploadImage } from "@/lib/publishService";
import { isValidPrice, DEFAULT_CURRENCY } from "@/lib/currency";

export async function saveCertificate(data: Partial<Certificate>, imageFile?: File | null) {
  try {
    // 1. Validation
    if (!data.title?.trim()) {
      throw new Error("Certificate title is required.");
    }
    if (!data.issuer?.trim()) {
      throw new Error("Certificate issuer is required.");
    }

    const pricingType = data.pricing_type === "paid" ? "paid" : "free";

    let cleanPrice: number | null = null;
    if (pricingType === "paid") {
      if (!isValidPrice(data.price)) {
        throw new Error("A valid positive price greater than 0 is required for paid certificates.");
      }
      cleanPrice = Number(data.price);
    } else {
      cleanPrice = null;
    }

    // 2. Image upload if new file provided
    let imageUrl = data.image || "";
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    // 3. Prepare payload
    const payload: any = {
      title: data.title.trim(),
      issuer: data.issuer.trim(),
      description: data.description || "",
      verify_url: data.verify_url || "",
      issue_date: data.issue_date || null,
      pricing_type: pricingType,
      price: cleanPrice,
      currency: data.currency || DEFAULT_CURRENCY,
    };

    if (imageUrl) {
      payload.image = imageUrl;
    }

    const isUpdate = !!data.id;

    if (!isUpdate) {
      payload.created_at = new Date().toISOString();
      const { data: result, error } = await supabase
        .from("certificates")
        .insert([payload])
        .select()
        .single();

      if (error) {
        if (error.code === "42703" || error.message?.includes("pricing_type")) {
          throw new Error(
            "Database table missing pricing columns. Please run migration 20261015000001_add_pricing_to_certificates.sql in your Supabase SQL editor."
          );
        }
        throw error;
      }
      return { success: true, data: result };
    } else {
      const { data: result, error } = await supabase
        .from("certificates")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();

      if (error) {
        if (error.code === "42703" || error.message?.includes("pricing_type")) {
          throw new Error(
            "Database table missing pricing columns. Please run migration 20261015000001_add_pricing_to_certificates.sql in your Supabase SQL editor."
          );
        }
        throw error;
      }
      return { success: true, data: result };
    }
  } catch (err: any) {
    console.error("Certificate Save Error:", err);
    return { success: false, message: err.message || "Failed to save certificate." };
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
