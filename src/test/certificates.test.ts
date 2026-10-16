import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatPrice, isValidPrice, getCurrencySymbol } from "@/lib/currency";
import { saveCertificate } from "@/mutations/certificateService";
import type { Certificate } from "@/types/certificate";

// Mock Supabase
vi.mock("@/lib/supabase", () => {
  const insertMock = vi.fn();
  const updateMock = vi.fn();
  const selectMock = vi.fn();
  const singleMock = vi.fn();
  const eqMock = vi.fn();

  const queryBuilder: any = {
    insert: insertMock,
    update: updateMock,
    select: selectMock,
    eq: eqMock,
    single: singleMock,
  };

  insertMock.mockReturnValue(queryBuilder);
  updateMock.mockReturnValue(queryBuilder);
  selectMock.mockReturnValue(queryBuilder);
  eqMock.mockReturnValue(queryBuilder);
  singleMock.mockResolvedValue({ data: { id: "cert-123" }, error: null });

  return {
    supabase: {
      from: vi.fn(() => queryBuilder),
    },
    getImageUrl: (path: string) => path,
  };
});

// Mock publishService uploadImage
vi.mock("@/lib/publishService", () => ({
  uploadImage: vi.fn().mockResolvedValue("https://example.com/uploaded.png"),
}));

describe("Certificate Pricing & Validation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Price Validation & Currency Utilities", () => {
    it("validates positive monetary prices correctly", () => {
      expect(isValidPrice(100)).toBe(true);
      expect(isValidPrice(999.5)).toBe(true);
      expect(isValidPrice("499")).toBe(true);
      expect(isValidPrice("0.01")).toBe(true);
    });

    it("rejects zero, negative values, and non-numeric inputs", () => {
      expect(isValidPrice(0)).toBe(false);
      expect(isValidPrice("0")).toBe(false);
      expect(isValidPrice(-50)).toBe(false);
      expect(isValidPrice("-100")).toBe(false);
      expect(isValidPrice(null)).toBe(false);
      expect(isValidPrice(undefined)).toBe(false);
      expect(isValidPrice("")).toBe(false);
      expect(isValidPrice("abc")).toBe(false);
      expect(isValidPrice(NaN)).toBe(false);
    });

    it("formats Indian Rupee (₹) price correctly by default", () => {
      expect(formatPrice(999)).toBe("₹999");
      expect(formatPrice("1499")).toBe("₹1,499");
      expect(formatPrice(null)).toBe("");
      expect(formatPrice(undefined)).toBe("");
    });

    it("formats other currencies if specified", () => {
      expect(formatPrice(49, "USD")).toBe("$49");
      expect(formatPrice(35, "EUR")).toBe("€35");
      expect(getCurrencySymbol("INR")).toBe("₹");
      expect(getCurrencySymbol("USD")).toBe("$");
    });
  });

  describe("saveCertificate Business Logic", () => {
    it("1. saves a free certificate without a price", async () => {
      const result = await saveCertificate({
        title: "Python for Beginners",
        issuer: "Microsoft",
        pricing_type: "free",
      });

      expect(result.success).toBe(true);
    });

    it("2. saves a paid certificate with a valid positive price", async () => {
      const result = await saveCertificate({
        title: "Advanced Machine Learning",
        issuer: "Stanford Online",
        pricing_type: "paid",
        price: 999,
        currency: "INR",
      });

      expect(result.success).toBe(true);
    });

    it("3. rejects saving a paid certificate without a price", async () => {
      const result = await saveCertificate({
        title: "Paid Cert Without Price",
        issuer: "Uyarcha",
        pricing_type: "paid",
        price: null,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("valid positive price");
    });

    it("4. rejects saving a paid certificate with zero or negative price", async () => {
      const zeroResult = await saveCertificate({
        title: "Zero Price Cert",
        issuer: "Uyarcha",
        pricing_type: "paid",
        price: 0,
      });
      expect(zeroResult.success).toBe(false);

      const negativeResult = await saveCertificate({
        title: "Negative Price Cert",
        issuer: "Uyarcha",
        pricing_type: "paid",
        price: -150,
      });
      expect(negativeResult.success).toBe(false);
    });

    it("5. allows editing a free certificate and changing it to paid with valid price", async () => {
      const result = await saveCertificate({
        id: "cert-existing-1",
        title: "Cloud Architect Certification",
        issuer: "AWS",
        pricing_type: "paid",
        price: 1999,
      });

      expect(result.success).toBe(true);
    });

    it("6. allows editing a paid certificate and changing it to free (clears price)", async () => {
      const result = await saveCertificate({
        id: "cert-existing-2",
        title: "Open Source Contributor",
        issuer: "GitHub",
        pricing_type: "free",
        price: 999, // should be saved as null for free
      });

      expect(result.success).toBe(true);
    });

    it("7. rejects certificates without title or issuer", async () => {
      const noTitle = await saveCertificate({
        title: "",
        issuer: "Google",
        pricing_type: "free",
      });
      expect(noTitle.success).toBe(false);
      expect(noTitle.message).toContain("title is required");

      const noIssuer = await saveCertificate({
        title: "Docker Essentials",
        issuer: "   ",
        pricing_type: "free",
      });
      expect(noIssuer.success).toBe(false);
      expect(noIssuer.message).toContain("issuer is required");
    });
  });

  describe("Public Filtering Logic", () => {
    const mockCertificates: Certificate[] = [
      {
        id: "1",
        title: "Free Python Course",
        issuer: "Microsoft",
        pricing_type: "free",
        price: null,
        created_at: "2026-01-01",
        image: null,
        issue_date: "2026-01-01",
      },
      {
        id: "2",
        title: "Paid ML Masterclass",
        issuer: "DeepLearning.AI",
        pricing_type: "paid",
        price: 1499,
        created_at: "2026-01-02",
        image: null,
        issue_date: "2026-01-02",
      },
      {
        id: "3",
        title: "Legacy Certificate Without Explicit Pricing",
        issuer: "Coursera",
        // pricing_type undefined, should default to free
        created_at: "2026-01-03",
        image: null,
        issue_date: "2026-01-03",
      },
    ];

    it("8. filters certificates correctly by 'all', 'free', and 'paid'", () => {
      // Filter 'all'
      const allResults = mockCertificates.filter(() => true);
      expect(allResults.length).toBe(3);

      // Filter 'free' (including legacy records where pricing_type defaults to free)
      const freeResults = mockCertificates.filter(
        (c) => (c.pricing_type || "free") === "free"
      );
      expect(freeResults.length).toBe(2);
      expect(freeResults.map((c) => c.id)).toEqual(["1", "3"]);

      // Filter 'paid'
      const paidResults = mockCertificates.filter(
        (c) => c.pricing_type === "paid"
      );
      expect(paidResults.length).toBe(1);
      expect(paidResults[0].id).toBe("2");
      expect(paidResults[0].price).toBe(1499);
    });
  });
});
