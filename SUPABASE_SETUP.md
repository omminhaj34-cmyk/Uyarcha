# Supabase Production Setup Fixes

Follow these steps in your Supabase SQL Editor to ensure the blog is stable and secure.

## 1. Create Performance Indexes (STEP 8)
Run these commands to speed up queries on large datasets:

```sql
-- Speed up article sorting by date
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts (date DESC);

-- Speed up status filtering (published vs draft)
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);

-- Speed up URL-slug lookup
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);

-- Speed up featured lookup
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts (featured) WHERE featured = true;
```

## 2. Row Level Security (RLS) Policies
Ensure your tables are protected by RLS:

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy (Allow everyone to see published posts)
CREATE POLICY "Public can read published posts"
ON posts FOR SELECT
USING (status = 'published' AND date <= NOW());

-- 2. Authenticated All Access (Allow logged-in users to manage posts)
CREATE POLICY "Authenticated users can manage posts"
ON posts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

## 3. Storage Bucket Policy
Make sure your `images` bucket is Public and has proper policies:

1.  Go to **Storage** in Supabase dashboard.
2.  Select **images** bucket.
3.  Ensure **Public** toggle is ON.
4.  Add a Policy for `INSERT` and `UPDATE` allowed for **Authenticated** users.

## 4. Users Table (RBAC)
If you want to use Admin/Editor roles, your `users` table should have a `role` column:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'editor';
```
