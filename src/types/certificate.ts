export type Certificate = {
  id: string;
  title: string;
  issuer: string | null;
  description?: string | null;
  image: string | null;
  verify_url?: string | null;
  issue_date: string | null;
  created_at: string;
};
