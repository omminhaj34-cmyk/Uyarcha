export type CertificatePricingType = "free" | "paid";

export const DEFAULT_CURRENCY = "INR";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Returns currency symbol for a code (default: ₹ for INR)
 */
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  const code = (currency || DEFAULT_CURRENCY).toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
}

/**
 * Formats a numeric price with its currency symbol (e.g. ₹999)
 */
export function formatPrice(amount?: number | string | null, currency: string = DEFAULT_CURRENCY): string {
  if (amount === undefined || amount === null || amount === "") return "";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "";
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${num.toLocaleString("en-IN")}`;
}

/**
 * Validates whether a given price input is a valid positive monetary number
 */
export function isValidPrice(price: unknown): boolean {
  if (price === undefined || price === null || price === "") return false;
  const num = typeof price === "number" ? price : parseFloat(String(price));
  return !isNaN(num) && isFinite(num) && num > 0;
}
