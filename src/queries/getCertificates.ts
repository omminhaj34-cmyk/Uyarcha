import { supabase } from "@/lib/supabase";
import type { Certificate } from "@/types/certificate";

const FULL_FIELDS = "id, title, issuer, image, issue_date, verify_url, description, pricing_type, price, currency";
const FALLBACK_FIELDS = "id, title, issuer, image, issue_date, verify_url, description";

export async function getCertificates(): Promise<Certificate[]> {
  try {
    // 1. Attempt query with pricing fields
    const { data, error } = await supabase
      .from("certificates")
      .select(FULL_FIELDS)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((item: any) => ({
        ...item,
        pricing_type: item.pricing_type || "free",
        price: item.price !== null && item.price !== undefined ? Number(item.price) : null,
        currency: item.currency || "INR",
      }));
    }

    // 2. If pricing columns do not exist yet in schema cache (e.g. 42703), fall back gracefully
    if (error && (error.code === "42703" || error.message?.includes("pricing_type"))) {
      console.warn("Pricing columns not yet detected in certificates table; using fallback query.");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("certificates")
        .select(FALLBACK_FIELDS)
        .order("created_at", { ascending: false });

      if (fallbackError) {
        console.error("Fallback certificate query error:", fallbackError);
        return [];
      }

      return (fallbackData || []).map((item: any) => ({
        ...item,
        pricing_type: "free" as const,
        price: null,
        currency: "INR",
      }));
    }

    if (error) {
      console.error("Certificates query error:", error);
      return [];
    }

    return [];
  } catch (err) {
    console.error("Certificates query exception:", err);
    return [];
  }
}
