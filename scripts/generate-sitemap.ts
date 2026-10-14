import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Helper to read .env file if environment variables are not set in process.env
function loadEnvVariables() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=')
        if (key && values.length > 0) {
          const val = values.join('=').trim()
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val
          }
        }
      }
    }
  }
}

loadEnvVariables()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''
const DOMAIN = "https://uyarcha.tech"

async function generate() {
  console.log("Generating sitemap for domain:", DOMAIN)
  
  let posts: Array<{ slug: string; publish_date?: string; date?: string; updated_at?: string }> = []

  if (SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes("placeholder")) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      const { data, error } = await supabase
        .from("posts")
        .select("slug, publish_date, created_at")
        .eq("status", "published")

      if (!error && data) {
        posts = data
      } else if (error) {
        console.warn("Could not query posts for sitemap:", error.message)
      }
    } catch (e: any) {
      console.warn("Sitemap DB fetch error (proceeding with static routes):", e.message)
    }
  } else {
    console.log("Supabase credentials not available, generating static routes only.")
  }

  const staticRoutes = [
    { loc: `${DOMAIN}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${DOMAIN}/blog`, priority: "0.9", changefreq: "daily" },
    { loc: `${DOMAIN}/about`, priority: "0.7", changefreq: "monthly" },
    { loc: `${DOMAIN}/contact`, priority: "0.6", changefreq: "monthly" },
    { loc: `${DOMAIN}/certificates`, priority: "0.6", changefreq: "monthly" },
    { loc: `${DOMAIN}/privacy-policy`, priority: "0.4", changefreq: "yearly" },
  ]

  const today = new Date().toISOString().split('T')[0]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
${posts.map(post => {
  const lastmod = (post.updated_at || post.publish_date || post.date || today).split('T')[0]
  return `  <url>
    <loc>${DOMAIN}/article/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
}).join('\n')}
</urlset>`

  const publicDir = path.resolve(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml')
  fs.writeFileSync(sitemapPath, sitemap.trim())
  console.log(`Sitemap generated successfully (${staticRoutes.length + posts.length} routes) at: ${sitemapPath}`)
}

generate().catch((err) => {
  console.error("Sitemap generation error:", err)
  process.exit(0) // Do not fail build if network is unavailable
})
