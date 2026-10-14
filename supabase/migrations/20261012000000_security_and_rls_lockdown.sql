-- ==============================================================================
-- UYARCHA PRODUCTION DATABASE & STORAGE SECURITY LOCKDOWN MIGRATION
-- File: supabase/migrations/20261012000000_security_and_rls_lockdown.sql
-- Description: Consolidates and replaces conflicting SQL schemas.
-- Fixes pf_columns query bug, enables strict RLS, defines is_admin() helper,
-- secures increment_views(), and restricts storage write operations to admins.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BASE SCHEMA HARDENING & EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE & ADMIN HELPER FUNCTION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security Definer helper function to check admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. POSTS SCHEMA FIXES & COLUMN HARDENING (FIXES pf_columns BUG)
-- ------------------------------------------------------------------------------
DO $$ 
BEGIN
    -- Fix: Use information_schema.columns instead of non-existent pf_columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'deleted'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN deleted boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'publish_date'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN publish_date timestamp with time zone DEFAULT now();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN status text DEFAULT 'published';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'views'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN views integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'featured'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN featured boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'readTime'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN "readTime" text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'seo_title'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN seo_title text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'seo_description'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN seo_description text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'seo_keywords'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN seo_keywords text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'tags'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN tags text[] DEFAULT '{}';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. CATEGORIES, TAGS & POST_TAGS NORMALIZATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_tags (
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- ------------------------------------------------------------------------------
-- 5. CERTIFICATES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    issuer text,
    description text,
    image text,
    verify_url text,
    issue_date date,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'certificates' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.certificates ADD COLUMN is_public boolean DEFAULT true;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 6. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_pubdate ON public.posts (status, publish_date DESC) WHERE (deleted IS FALSE OR deleted IS NULL);
CREATE INDEX IF NOT EXISTS idx_posts_views ON public.posts (views DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_public ON public.certificates (is_public, created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. CLEAN & STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Enable RLS on all content tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- A. POSTS POLICIES:
-- Drop older permissive and redundant policies
DROP POLICY IF EXISTS "Allow management" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON public.posts;
DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can manage posts" ON public.posts;
DROP POLICY IF EXISTS "Allow public read-only access" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

-- Public (anon & authenticated) can SELECT ONLY published, non-deleted posts with publish_date <= now()
CREATE POLICY "Public can view published posts" ON public.posts
    FOR SELECT
    USING (
        status = 'published' 
        AND (deleted IS FALSE OR deleted IS NULL) 
        AND publish_date <= now()
    );

-- Authenticated admins can SELECT all posts (including drafts, scheduled, soft-deleted)
CREATE POLICY "Admins can view all posts" ON public.posts
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Only authenticated users whose profiles.role = 'admin' can INSERT, UPDATE or DELETE
CREATE POLICY "Admins can insert posts" ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update posts" ON public.posts
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete posts" ON public.posts
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- B. CERTIFICATES POLICIES:
DROP POLICY IF EXISTS "Public can view public certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can update certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can delete certificates" ON public.certificates;

CREATE POLICY "Public can view public certificates" ON public.certificates
    FOR SELECT
    USING (is_public IS TRUE OR is_public IS NULL);

CREATE POLICY "Admins can view all certificates" ON public.certificates
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can insert certificates" ON public.certificates
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update certificates" ON public.certificates
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete certificates" ON public.certificates
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- C. CATEGORIES, TAGS & POST_TAGS POLICIES:
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view tags" ON public.tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.tags
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can view post_tags" ON public.post_tags;
DROP POLICY IF EXISTS "Admins can manage post_tags" ON public.post_tags;
CREATE POLICY "Public can view post_tags" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage post_tags" ON public.post_tags
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. UNIFIED, SECURE increment_views FUNCTION
-- ------------------------------------------------------------------------------
-- Single SECURITY DEFINER function with SET search_path = public,
-- limited to published, non-deleted posts where publish_date <= now().
CREATE OR REPLACE FUNCTION public.increment_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.posts
    SET views = COALESCE(views, 0) + 1
    WHERE id = post_id
      AND status = 'published'
      AND (deleted IS FALSE OR deleted IS NULL)
      AND publish_date <= now();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_views(uuid) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 9. STORAGE BUCKET HARDENING & POLICIES
-- ------------------------------------------------------------------------------
-- Ensure bucket 'Image' (and alias 'images') exist, public read, 5MB limit, image mime types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'Image',
    'Image',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images',
    'images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Storage Policies: Public can read, Admins only can insert/update/delete
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view Image bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

CREATE POLICY "Public can view images" ON storage.objects
    FOR SELECT
    USING (bucket_id IN ('Image', 'images'));

CREATE POLICY "Admins can upload images" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN ('Image', 'images')
        AND public.is_admin()
    );

CREATE POLICY "Admins can update images" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id IN ('Image', 'images') AND public.is_admin())
    WITH CHECK (bucket_id IN ('Image', 'images') AND public.is_admin());

CREATE POLICY "Admins can delete images" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id IN ('Image', 'images') AND public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. HELPER SQL: CREATE FIRST ADMIN PROFILE
-- ------------------------------------------------------------------------------
-- Run this in Supabase SQL editor after creating the admin user in Supabase Auth:
-- INSERT INTO public.profiles (id, role)
-- VALUES ('<YOUR-AUTH-USER-UUID-HERE>', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
