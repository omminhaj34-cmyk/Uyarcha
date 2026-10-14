# Supabase Production Setup & Security Lockdown

This document explains the unified database and storage setup for Uyarcha. All previous contradictory SQL files have been consolidated into a single authoritative migration:
`supabase/migrations/20261012000000_security_and_rls_lockdown.sql`

---

## 1. Apply the Unified Database Migration

Run the entire contents of [supabase/migrations/20261012000000_security_and_rls_lockdown.sql](file:///supabase/migrations/20261012000000_security_and_rls_lockdown.sql) in your **Supabase Dashboard > SQL Editor**, or apply it using the Supabase CLI:

```bash
supabase db push
```

This migration automatically:
1. Fixes the `pf_columns` bug using `information_schema.columns`.
2. Creates and secures the `public.profiles` table with role checking (`role IN ('admin', 'editor')`).
3. Defines a recursion-safe `public.is_admin()` SECURITY DEFINER function.
4. Hardens `public.posts` and adds all required SEO/tag columns and performance indexes.
5. Enables strict Row Level Security (RLS) across `posts`, `certificates`, `categories`, `tags`, `post_tags`, and `profiles`.
6. Drops legacy open policies (e.g. `USING (true)`).
7. Restricts public (anon) access:
   - `posts`: only published, non-deleted posts with `publish_date <= now()`.
   - `certificates`: only public certificates (`is_public = true`).
8. Configures `increment_views` as a single `SECURITY DEFINER` function with `search_path = public`, restricted to published articles.
9. Locks down the `Image` storage bucket so only admin users can upload, update, or delete images (max 5MB, image MIME types only).

---

## 2. Manual Configuration in Supabase Dashboard

The following security settings must be configured manually in the Supabase Dashboard:

### A. Disable Public Sign-ups
1. Go to **Authentication > Configuration > Sign Up**.
2. Uncheck / Toggle OFF **"Allow new users to sign up"**.
3. Save changes. Only existing users or users invited by admins can authenticate.

### B. Configure Password Security Policy
1. Go to **Authentication > Configuration > Security**.
2. Set Minimum Password Length (recommended: 10+ characters).
3. Require uppercase, lowercase, numbers, and symbols according to your security posture.

### C. Enable Multi-Factor Authentication (MFA / TOTP)
1. Go to **Authentication > Configuration > MFA**.
2. Ensure **Time-based One-Time Password (TOTP)** is **Enabled**.
3. Set the max number of factors per user (e.g., 3-5).

### D. Rate Limiting
1. Go to **Authentication > Configuration > Rate Limits**.
2. Verify rate limits for Email/Password Sign-In, Token verification, and OTP to protect against brute force attacks.

---

## 3. Create the First Admin User

1. Go to **Authentication > Users** in the Supabase Dashboard and click **Add user > Create user**.
2. Enter the admin email and a strong password, then confirm creation.
3. Copy the newly created user's **User UID** (UUID).
4. Run the following query in the **SQL Editor** (replace the UUID placeholder):

```sql
INSERT INTO public.profiles (id, role)
VALUES ('PASTE-AUTH-USER-UUID-HERE', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

Now you can sign in at `/admin` on Uyarcha using this admin user's credentials!
