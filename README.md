# Uyarcha (উয়ার্চা / உயarcha) - Modern Tech Blog & CMS

Uyarcha is a high-performance tech blogging platform and CMS built with Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui, and a Supabase backend.

Live site: [https://uyarcha.tech](https://uyarcha.tech)

---

## Architecture Overview

- **Frontend**: Vite + React 18 + TypeScript + React Router v6
- **State Management & Caching**: TanStack React Query v5
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth + TOTP Multi-Factor Authentication (AAL2)
- **Storage**: Supabase Storage for secure media uploads with strict MIME validation
- **Serverless / Edge Functions**: Supabase Edge Functions (Deno + Resend + Cloudflare Turnstile verification)
- **Hosting**: Cloudflare Pages / Static Hosting with SPA routing and security headers

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended; v20+ supported)
- npm (v9 or higher)
- A Supabase project

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/uyarcha.git
cd Uyarcha
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your project values in `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### 3. Database Setup

Apply the consolidation migration in `supabase/migrations/` using the Supabase CLI or SQL Editor:

```bash
# Using Supabase CLI:
supabase db push

# Or run the SQL from:
# supabase/migrations/20261012000000_security_and_rls_lockdown.sql
```

### 4. Run Locally

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### 5. Production Build & Sitemap Generation

```bash
npm run build
```

This will run TypeScript checks, generate an updated `public/sitemap.xml`, and compile the production bundle to `dist/`.

---

## Admin Portal & Security

- Access the admin portal at `/admin`.
- Authentication uses real Supabase Email/Password authentication.
- Access requires a verified record in `public.profiles` where `role = 'admin'`.
- Supports Supabase TOTP Multi-Factor Authentication (AAL2).
- Automatic session inactivity sign-out after 30 minutes.
- Client-side login attempt throttling (30s lockout after 5 consecutive failures).
- Content sanitization (DOMPurify) and Zod schema validation on story inputs.

---

## License

This project is private and proprietary. All rights reserved.
