import { supabase } from "@/lib/supabase";
import type { Certificate } from "@/types/certificate";

const ADMIN_LIST_FIELDS = "id, title, issuer, image, issue_date, created_at, verify_url";

export async function getAdminCertificates(): Promise<Certificate[]> {
  try {
    const { data, error } = await supabase
      .from("certificates")
      .select(ADMIN_LIST_FIELDS)
      .order("created_at", { ascending: false, nullsFirst: false });

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
      .select("description")
      .eq("id", id)
      .maybeSingle();

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
