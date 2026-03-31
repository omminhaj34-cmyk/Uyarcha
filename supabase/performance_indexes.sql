-- PERFORMANCE INDEXING FOR UYARCHA CMS

-- 1. Optimize list queries filtered by status and publish_date
CREATE INDEX IF NOT EXISTS idx_posts_status_publish_date 
ON posts (status, publish_date DESC) 
WHERE status = 'published';

-- 2. Optimize slug lookups for ArticlePage (Primary frontend route)
CREATE INDEX IF NOT EXISTS idx_posts_slug 
ON posts (slug);

-- 3. Optimize category-based browsing and related posts sections
CREATE INDEX IF NOT EXISTS idx_posts_category_status 
ON posts (category, status) 
WHERE status = 'published';

-- 4. Optimize trending posts (sorting by views)
CREATE INDEX IF NOT EXISTS idx_posts_views 
ON posts (views DESC) 
WHERE status = 'published';

-- 5. Optimize Admin dashboard sorting (created_at is the primary admin sort)
CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON posts (created_at DESC);

-- 6. Optimize featured articles fetching
CREATE INDEX IF NOT EXISTS idx_posts_featured 
ON posts (featured) 
WHERE featured = true AND status = 'published';
