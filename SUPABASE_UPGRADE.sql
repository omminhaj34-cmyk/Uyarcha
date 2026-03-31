-- STEP 3: Admin Role Protection
-- Profiles table to store roles linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- STEP 4: Atomic View Counter RPC
CREATE OR REPLACE FUNCTION public.increment_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.posts
    SET views = COALESCE(views, 0) + 1
    WHERE id = post_id;
END;
$$;

-- STEP 7: Normalized Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- STEP 8: Normalized Tag System
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

-- STEP 9: Soft Delete Support
-- Add deleted column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pf_columns WHERE table_name = 'posts' AND column_name = 'deleted') THEN
        ALTER TABLE public.posts ADD COLUMN deleted boolean DEFAULT false;
    END IF;
END $$;

-- STEP 14: Search Index for Performance
CREATE INDEX IF NOT EXISTS idx_posts_title ON public.posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_status_deleted ON public.posts (status, deleted);
CREATE INDEX IF NOT EXISTS idx_posts_publish_date ON public.posts (publish_date DESC);

-- STEP 15: Security Improvement (Authenticated Only Writes)
-- Update existing policies to be more restrictive
DROP POLICY IF EXISTS "Allow management" ON public.posts;

CREATE POLICY "Admins can manage posts" ON public.posts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Public can view published posts" ON public.posts
    FOR SELECT 
    USING (status = 'published' AND deleted = false AND publish_date <= now());
