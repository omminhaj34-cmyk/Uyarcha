-- ==============================================================================
-- UYARCHA JOBS TABLE MIGRATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    company_name text NOT NULL,
    role text NOT NULL,
    description text NOT NULL,
    work_arrangement text NOT NULL DEFAULT 'Remote' CHECK (work_arrangement IN ('Remote', 'Hybrid', 'On-site')),
    employment_type text NOT NULL DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Internship')),
    location text,
    image_url text,
    application_url text,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance on public and admin queries
CREATE INDEX IF NOT EXISTS idx_jobs_status_published_at ON public.jobs (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_role ON public.jobs (role);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 1. Public can read only published jobs
DROP POLICY IF EXISTS "Public can view published jobs" ON public.jobs;
CREATE POLICY "Public can view published jobs" ON public.jobs
    FOR SELECT
    USING (status = 'published');

-- 2. Authenticated Admins can view all jobs (including drafts)
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;
CREATE POLICY "Admins can view all jobs" ON public.jobs
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 3. Authenticated Admins can create jobs
DROP POLICY IF EXISTS "Admins can insert jobs" ON public.jobs;
CREATE POLICY "Admins can insert jobs" ON public.jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- 4. Authenticated Admins can update jobs
DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
CREATE POLICY "Admins can update jobs" ON public.jobs
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Authenticated Admins can delete jobs
DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
CREATE POLICY "Admins can delete jobs" ON public.jobs
    FOR DELETE
    TO authenticated
    USING (public.is_admin());
