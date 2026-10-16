-- ==============================================================================
-- UYARCHA CERTIFICATES PRICING MIGRATION (FREE / PAID SUPPORT)
-- Migration: 20261015000001_add_pricing_to_certificates.sql
-- Description: Adds pricing_type, price, and currency fields to public.certificates.
-- Enforces integrity constraints for free vs paid certificates.
-- Preserves existing certificate records and RLS policies.
-- ==============================================================================

-- 1. ADD PRICING COLUMNS IF NOT ALREADY PRESENT
ALTER TABLE public.certificates 
    ADD COLUMN IF NOT EXISTS pricing_type text DEFAULT 'free' NOT NULL,
    ADD COLUMN IF NOT EXISTS price numeric,
    ADD COLUMN IF NOT EXISTS currency text DEFAULT 'INR' NOT NULL;

-- 2. ENSURE PRICING TYPE VALUES ARE VALID
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_certificates_pricing_type'
    ) THEN
        ALTER TABLE public.certificates 
            ADD CONSTRAINT check_certificates_pricing_type 
            CHECK (pricing_type IN ('free', 'paid'));
    END IF;
END $$;

-- 3. ENSURE PRICE INTEGRITY FOR FREE VS PAID CERTIFICATES
-- Free certificates must have null or 0 price.
-- Paid certificates must have a valid positive price (> 0).
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_certificates_price_rules'
    ) THEN
        ALTER TABLE public.certificates 
            ADD CONSTRAINT check_certificates_price_rules 
            CHECK (
                (pricing_type = 'free' AND (price IS NULL OR price = 0)) OR
                (pricing_type = 'paid' AND price IS NOT NULL AND price > 0)
            );
    END IF;
END $$;

-- 4. BACKFILL EXISTING CERTIFICATES TO 'free' IF NOT SET
UPDATE public.certificates
SET pricing_type = 'free',
    currency = COALESCE(currency, 'INR')
WHERE pricing_type IS NULL OR pricing_type NOT IN ('free', 'paid');

-- 5. PERFORMANCE INDEX FOR FILTERING
CREATE INDEX IF NOT EXISTS idx_certificates_pricing_type 
    ON public.certificates(pricing_type);

-- 6. VERIFY ROW LEVEL SECURITY REMAINS ACTIVE
-- (Existing policies defined in 20261012000000_security_and_rls_lockdown.sql remain active)
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
