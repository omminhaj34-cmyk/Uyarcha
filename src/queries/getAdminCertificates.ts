import { supabase } from "@/lib/supabase";
import type { Certificate } from "@/types/certificate";

const ADMIN_FULL_FIELDS = "id, title, issuer, image, issue_date, created_at, verify_url, description, pricing_type, price, currency";
const ADMIN_FALLBACK_FIELDS = "id, title, issuer, image, issue_date, created_at, verify_url, description";

export async function getAdminCertificates(): Promise<Certificate[]> {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select(ADMIN_FULL_FIELDS)
      .order("created_at", { ascending: false, nullsFirst: false });

    if (!error && data) {
      return data.map((item: any) => ({
        ...item,
        pricing_type: item.pricing_type || "free",
        price: item.price !== null && item.price !== undefined ? Number(item.price) : null,
        currency: item.currency || "INR",
      }));
    }

    if (error && (error.code === "42703" || error.message?.includes("pricing_type"))) {
      console.warn("Pricing columns not yet detected in certificates table; using fallback admin query.");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("certificates")
        .select(ADMIN_FALLBACK_FIELDS)
        .order("created_at", { ascending: false, nullsFirst: false });

      if (fallbackError) {
        console.error("CERT ADMIN FALLBACK QUERY ERROR", fallbackError);
        throw new Error(fallbackError.message);
      }

      return (fallbackData || []).map((item: any) => ({
        ...item,
        pricing_type: "free" as const,
        price: null,
        currency: "INR",
      }));
    }

    if (error) {
      console.error("CERT QUERY ERROR", error);
      throw new Error(error.message);
    }
    
    return data || [];
  } catch (err: any) {
    console.error("CERT QUERY EXCEPTION", err);
    throw new Error(err.message || "Failed to fetch admin certificates");
  }
}

export async function getCertificateContentForAdmin(id: string) {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select("description, pricing_type, price, currency")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return data;
    }

    // Fallback if pricing columns don't exist
    if (error && (error.code === "42703" || error.message?.includes("pricing_type"))) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("certificates")
        .select("description")
        .eq("id", id)
        .maybeSingle();

      if (fallbackError) throw fallbackError;
      return fallbackData || null;
    }

    if (error) {
       console.error("CERT CONTENT EXCEPTION", error);
       throw new Error(error.message);
    }
    
    return data || null;
  } catch(err: any) {
    console.error("CERT CONTENT FETCH FAILED", err);
    throw new Error(err.message);
  }
}
