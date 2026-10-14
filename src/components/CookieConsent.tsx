import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, Shield, Check, X } from "lucide-react";

export const CONSENT_STORAGE_KEY = "uyarcha_cookie_consent";
export const CONSENT_EVENT = "uyarcha_consent_changed";

export function getCookieConsent(): "accepted" | "declined" | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_STORAGE_KEY) as "accepted" | "declined" | null;
}

export function setCookieConsent(status: "accepted" | "declined") {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_STORAGE_KEY, status);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: status }));
}

/**
 * CookieConsent: Responsive consent banner.
 * NOTE: For full EEA/UK GDPR compliance with Google AdSense, Google mandates
 * using a Google-certified CMP integrated with the IAB TCF (e.g. Google's free CMP
 * available directly in the AdSense Dashboard > Privacy & messaging).
 */
export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
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
            <h3 className="text-sm font-bold tracking-tight">We value your privacy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uyarcha and our partners use cookies to enhance navigation, analyze site performance, and serve relevant advertisements via Google AdSense.
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
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              Essential Only
            </button>
            <button
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
