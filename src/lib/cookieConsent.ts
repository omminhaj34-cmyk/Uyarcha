export const CONSENT_STORAGE_KEY = "uyarcha_cookie_consent";
export const CONSENT_EVENT = "uyarcha_consent_changed";
export const REOPEN_CONSENT_EVENT = "uyarcha_reopen_consent";

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
 * Triggers the Cookie Consent banner to reappear so users can update their choices.
 */
export function reopenCookieConsent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REOPEN_CONSENT_EVENT));
}
