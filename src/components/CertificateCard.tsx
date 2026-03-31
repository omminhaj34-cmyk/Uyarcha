import React, { useMemo, useState, memo } from "react";
import { getImageUrl } from "@/lib/supabase";
import { ExternalLink, ShieldAlert } from "lucide-react";

interface CertificateCardProps {
  title: string;
  issuer: string;
  date: string;
  verify_url?: string | null;
  image?: string | null;
}

const getPlatformFromUrl = (url?: string) => {
    if (!url) return null;
    try {
        const domain = new URL(url).hostname.toLowerCase();
        if (domain.includes('coursera')) return 'Coursera';
        if (domain.includes('udemy')) return 'Udemy';
        if (domain.includes('linkedin')) return 'LinkedIn';
        if (domain.includes('freecodecamp')) return 'freeCodeCamp';
        if (domain.includes('credly')) return 'Credly';
        if (domain.includes('supabase')) return 'Supabase';
        if (domain.includes('aws')) return 'AWS';
        if (domain.includes('google')) return 'Google';
        if (domain.includes('microsoft')) return 'Microsoft';
        if (domain.includes('vercel')) return 'Vercel';
        return 'External';
    } catch {
        return 'External';
    }
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return "Unknown Date";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" });
    } catch {
        return dateStr;
    }
};

const CertificateCard = ({ title, issuer, date, verify_url, image }: CertificateCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const displayImage = getImageUrl(image || "", "card") || '/placeholder.svg';
  
  // URL Validation and Safety
  const { safeUrl, platform, isValid } = useMemo(() => {
     if (!verify_url || verify_url.trim() === "") {
        return { safeUrl: null, platform: null, isValid: false };
     }

     const trimmedLink = verify_url.trim();
     const processedUrl = trimmedLink.startsWith("http") ? trimmedLink : `https://${trimmedLink}`;
     
     try {
         new URL(processedUrl);
         return { safeUrl: processedUrl, platform: getPlatformFromUrl(processedUrl), isValid: true };
     } catch (err) {
         console.warn(`Invalid certificate URL detected for ${title}:`, trimmedLink);
         return { safeUrl: null, platform: null, isValid: false };
     }
  }, [verify_url, title]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300 group flex flex-col justify-between h-full relative overflow-hidden focus-within:ring-2 focus-within:ring-accent focus-within:border-accent">
      <div>
        <div className="mb-5 relative aspect-video overflow-hidden rounded-xl bg-muted flex items-center justify-center border border-border/50">
            {!imageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img 
              src={displayImage} 
              alt={title} 
              onLoad={() => setImageLoaded(true)}
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; setImageLoaded(true); }} 
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
              loading="lazy" 
            />
        </div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-black uppercase text-accent tracking-widest">{issuer}</span>
          {platform && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border shadow-sm">
                {platform}
            </span>
          )}
        </div>
        <h3 className="font-display text-xl font-bold text-foreground leading-tight mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-medium mb-6">Awarded {formatDate(date)}</p>
      </div>
      
      {isValid && safeUrl ? (
        <a 
            href={safeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label={`View ${title} Certificate`}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 mt-auto text-sm font-bold border rounded-xl group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98]"
        >
            View Certificate <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
      ) : (
        <button 
            disabled 
            aria-label="Certificate unavailable"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 mt-auto text-sm font-bold border border-border/50 rounded-xl opacity-50 cursor-not-allowed bg-muted text-muted-foreground transition-all duration-300 focus:outline-none"
        >
            <ShieldAlert size={14} /> Certificate unavailable
        </button>
      )}
    </div>
  );
};

const MemorizedCertificateCard = memo(CertificateCard);
export default MemorizedCertificateCard;
