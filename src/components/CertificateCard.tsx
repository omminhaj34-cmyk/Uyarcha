import React, { useMemo, useState, memo } from "react";
import { getImageUrl } from "@/lib/supabase";
import { ArrowRight, ExternalLink, ShieldAlert, Award } from "lucide-react";
import type { CertificatePricingType } from "@/types/certificate";
import { formatPrice, DEFAULT_CURRENCY } from "@/lib/currency";

interface CertificateCardProps {
  title: string;
  issuer: string;
  date?: string;
  verify_url?: string | null;
  image?: string | null;
  description?: string | null;
  pricing_type?: CertificatePricingType;
  price?: number | null;
  currency?: string | null;
}

const getPlatformFromUrl = (url?: string) => {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes("coursera")) return "Coursera";
    if (domain.includes("udemy")) return "Udemy";
    if (domain.includes("linkedin")) return "LinkedIn";
    if (domain.includes("freecodecamp")) return "freeCodeCamp";
    if (domain.includes("credly")) return "Credly";
    if (domain.includes("supabase")) return "Supabase";
    if (domain.includes("aws")) return "AWS";
    if (domain.includes("google")) return "Google";
    if (domain.includes("microsoft")) return "Microsoft";
    if (domain.includes("vercel")) return "Vercel";
    return null;
  } catch {
    return null;
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" });
  } catch {
    return dateStr;
  }
};

const CertificateCard = ({
  title,
  issuer,
  date,
  verify_url,
  image,
  description,
  pricing_type = "free",
  price,
  currency = DEFAULT_CURRENCY,
}: CertificateCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayImage = image ? getImageUrl(image, "card") : null;
  const isPaid = pricing_type === "paid";
  const formattedDate = formatDate(date);

  // URL Validation and Safety
  const { safeUrl, platform, isValid } = useMemo(() => {
    if (!verify_url || verify_url.trim() === "") {
      return { safeUrl: null, platform: null, isValid: false };
    }

    const trimmedLink = verify_url.trim();
    const processedUrl = trimmedLink.startsWith("http") ? trimmedLink : `https://${trimmedLink}`;

    try {
      new URL(processedUrl);
      return {
        safeUrl: processedUrl,
        platform: getPlatformFromUrl(processedUrl),
        isValid: true,
      };
    } catch {
      return { safeUrl: null, platform: null, isValid: false };
    }
  }, [verify_url]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 group flex flex-col justify-between h-full relative overflow-hidden focus-within:ring-2 focus-within:ring-accent">
      <div>
        {/* Certificate Image or Fallback */}
        <div className="mb-5 relative aspect-video overflow-hidden rounded-xl bg-muted/50 flex items-center justify-center border border-border/60">
          {displayImage && !imageError ? (
            <>
              {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
              <img
                src={displayImage}
                alt={title}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-in-out ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center bg-gradient-to-br from-secondary/40 to-muted/80">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Award size={24} />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {issuer}
              </span>
            </div>
          )}

          {/* Platform badge overlay */}
          {platform && (
            <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-background/90 text-foreground backdrop-blur-sm border border-border shadow-xs">
              {platform}
            </span>
          )}
        </div>

        {/* Certificate Title */}
        <h3 className="font-display text-xl font-bold text-foreground leading-tight mb-1.5 group-hover:text-accent transition-colors">
          {title}
        </h3>

        {/* Issuer */}
        <p className="text-xs font-semibold text-muted-foreground mb-3">
          Issuer: <span className="font-bold text-foreground/90">{issuer}</span>
        </p>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {description}
          </p>
        )}

        {/* Awarded Date (if provided) */}
        {formattedDate && (
          <p className="text-xs text-muted-foreground/75 mb-4">
            Awarded {formattedDate}
          </p>
        )}
      </div>

      <div>
        {/* Pricing Badge & Price Display */}
        <div className="pt-3 border-t border-border/60 mb-4 flex items-center justify-between gap-3">
          {isPaid ? (
            <>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/40">
                PAID
              </span>
              <span className="text-lg font-black text-foreground">
                {formatPrice(price, currency || DEFAULT_CURRENCY)}
              </span>
            </>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
              FREE
            </span>
          )}
        </div>

        {/* Action Button */}
        {isValid && safeUrl ? (
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${title} Certificate`}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold border border-border rounded-xl group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all duration-300 shadow-xs focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <span>View Certificate</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        ) : (
          <button
            disabled
            aria-label="Certificate unavailable"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold border border-border/50 rounded-xl opacity-50 cursor-not-allowed bg-muted text-muted-foreground transition-all duration-300"
          >
            <ShieldAlert size={14} />
            <span>Certificate unavailable</span>
          </button>
        )}
      </div>
    </div>
  );
};

const MemorizedCertificateCard = memo(CertificateCard);
export default MemorizedCertificateCard;
