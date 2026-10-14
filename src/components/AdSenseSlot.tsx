import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getCookieConsent, CONSENT_EVENT } from "./CookieConsent";

interface AdSenseSlotProps {
  slotId?: string;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/**
 * AdSenseSlot: AdSense-ready responsive ad slot.
 * - Loads the AdSense script ONLY after user grants cookie consent.
 * - Never renders on /admin, /contact, or 404 pages.
 * - Reserves fixed/responsive minimum dimensions to prevent Cumulative Layout Shift (CLS).
 */
export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({
  slotId = "1234567890",
  format = "auto",
  className = "",
  style = {},
}) => {
  const location = useLocation();
  const [hasConsent, setHasConsent] = useState<boolean>(() => getCookieConsent() === "accepted");
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushedRef = useRef(false);

  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  // 1. Exclude restricted routes (/admin, /contact, 404)
  const isRestrictedRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/contact" ||
    location.pathname.startsWith("/not-found");

  // 2. Listen for Cookie Consent updates
  useEffect(() => {
    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setHasConsent(customEvent.detail === "accepted");
    };

    window.addEventListener(CONSENT_EVENT, handleConsentChange);
    return () => {
      window.removeEventListener(CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  // 3. Conditionally load AdSense script once consent is granted
  useEffect(() => {
    if (isRestrictedRoute || !hasConsent || !clientId) return;

    const scriptId = "google-adsense-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [hasConsent, isRestrictedRoute, clientId]);

  // 4. Push AdSense slot when element is mounted and consented
  useEffect(() => {
    if (isRestrictedRoute || !hasConsent || isPushedRef.current) return;

    try {
      if (adRef.current && (window.adsbygoogle || clientId)) {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isPushedRef.current = true;
      }
    } catch (err) {
      console.warn("AdSense push error:", err);
    }
  }, [hasConsent, isRestrictedRoute, clientId]);

  if (isRestrictedRoute) {
    return null;
  }

  // Determine CLS reserve minimum heights
  let minHeightClass = "min-h-[100px]";
  if (format === "rectangle") minHeightClass = "min-h-[250px] max-w-[336px]";
  else if (format === "horizontal") minHeightClass = "min-h-[90px]";
  else if (format === "vertical") minHeightClass = "min-h-[600px] max-w-[300px]";

  return (
    <div
      className={`w-full overflow-hidden flex flex-col items-center justify-center my-6 rounded-xl border border-dashed border-border/40 bg-muted/10 p-2 ${minHeightClass} ${className}`}
      style={style}
      aria-label="Advertisement Slot"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">
        Sponsored
      </span>

      {hasConsent && clientId ? (
        <ins
          ref={adRef}
          className="adsbygoogle block w-full text-center"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="text-xs text-muted-foreground/60 italic py-4 text-center">
          {!hasConsent
            ? "Advertisements paused until cookie consent is provided."
            : "Ad slot ready (Add VITE_ADSENSE_CLIENT_ID in your configuration)."}
        </div>
      )}
    </div>
  );
};

export default AdSenseSlot;
