export type CertificatePricingType = "free" | "paid";

export type Certificate = {
  id: string;
  title: string;
  issuer: string | null;
  description?: string | null;
  image: string | null;
  verify_url?: string | null;
  issue_date: string | null;
  created_at: string;
  pricing_type?: CertificatePricingType;
  price?: number | null;
  currency?: string | null;
  views?: number;
};

export type CertificateInput = {
  id?: string;
  title: string;
  issuer: string;
  description?: string;
  image?: string | null;
  verify_url?: string;
  issue_date?: string | null;
  pricing_type: CertificatePricingType;
  price?: number | null;
  currency?: string;
};
