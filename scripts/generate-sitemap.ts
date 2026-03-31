import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

/* 
Feature 9: Sitemap Generator Script
Run this with: npx tsx generate-sitemap.ts
*/

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
)

const DOMAIN = "https://uyarcha.com" // Replace with your domain

async function generate() {
  console.log("Generating sitemap...")
  
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, date")
    .eq("status", "published")

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${(posts || []).map(post => `
  <url>
    <loc>${DOMAIN}/article/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`

  fs.writeFileSync('./public/sitemap.xml', sitemap)
  console.log("Sitemap generated successfully in ./public/sitemap.xml")
}

generate()
