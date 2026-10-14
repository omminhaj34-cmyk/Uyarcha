import { supabase } from "@/lib/supabase";
import type { Certificate } from "@/types/certificate";
import { safeQuery } from "@/lib/db";

const LIST_FIELDS = "id, title, issuer, image, issue_date, verify_url";

export async function getCertificates() {
  const query = supabase
    .from("certificates")
    .select(LIST_FIELDS)
    .order("created_at", { ascending: false });

  const { success, data } = await safeQuery<Certificate[]>(query);
  return success ? (data || []) : [];
}
