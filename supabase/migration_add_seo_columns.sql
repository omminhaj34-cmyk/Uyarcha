-- DATABASE SCHEMA HARDENING FOR UYARCHA CMS (CAMELCASE VERSION)
-- Ensures consistency between database columns and application types

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS "seo_title" TEXT,
ADD COLUMN IF NOT EXISTS "seo_description" TEXT,
ADD COLUMN IF NOT EXISTS "seo_keywords" TEXT,
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "featured" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS "author" TEXT DEFAULT 'Uyarcha',
ADD COLUMN IF NOT EXISTS "readTime" TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts (featured);
