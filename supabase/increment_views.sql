-- RPC FUNCTION FOR VIEW INCREMENTING
-- This prevents race conditions and handles atomic increments

CREATE OR REPLACE FUNCTION increment_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts 
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id;
END;
$$;
