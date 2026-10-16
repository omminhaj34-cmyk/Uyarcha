import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, Check } from "lucide-react";
import {
  getCookieConsent,
  setCookieConsent,
  REOPEN_CONSENT_EVENT,
} from "@/lib/cookieConsent";


/**
 * CookieConsent: Responsive consent banner.
 * Allows users to choose between essential-only cookies or accepting advertising/performance cookies.
 * Note: For publishers serving ads to EEA, UK, and Swiss users, Google requires using a
 * Google-certified CMP integrated with the IAB TCF (configurable via Google AdSense > Privacy & messaging).
 */
export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      // Small delay for smooth entry on first visit
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for manual requests to re-open privacy settings
  useEffect(() => {
    const handleReopen = () => setIsVisible(true);
    window.addEventListener(REOPEN_CONSENT_EVENT, handleReopen);
    return () => window.removeEventListener(REOPEN_CONSENT_EVENT, handleReopen);
  }, []);

  const handleAccept = () => {
    setCookieConsent("accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    setCookieConsent("declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-card/95 backdrop-blur-md border border-border p-5 rounded-2xl shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
            <Cookie size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold tracking-tight text-foreground">Cookie & Privacy Preferences</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uyarcha uses essential storage for site operation and security. When enabled, third-party advertising partners such as Google AdSense may use cookies to serve relevant advertisements.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <Link
            to="/privacy-policy"
            className="text-[11px] font-medium text-muted-foreground hover:text-accent underline transition-colors"
          >
            Privacy Policy
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 shadow-md shadow-accent/20 transition-all flex items-center gap-1.5"
            >
              <Check size={14} /> Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
