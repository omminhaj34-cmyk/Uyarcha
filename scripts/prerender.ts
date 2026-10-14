import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [k, ...rest] = trimmed.split("=");
        if (k && !process.env[k.trim()]) {
          process.env[k.trim()] = rest.join("=").trim();
        }
      }
    }
  }
}

loadEnv();

const DOMAIN = "https://uyarcha.tech";
const distDir = path.resolve(process.cwd(), "dist");

interface RouteMeta {
  route: string;
  title: string;
  description: string;
  ogImage?: string;
  contentSnippet?: string;
}

async function prerender() {
  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.warn("dist/index.html not found, skipping prerender step.");
    return;
  }

  const template = fs.readFileSync(templatePath, "utf-8");
  console.log("Starting build-time prerender for crawler optimization...");

  const routes: RouteMeta[] = [
    {
      route: "/blog",
      title: "Blog - Engineering, Tech & Tutorials | Uyarcha",
      description: "Explore in-depth software engineering, modern web technologies, AI tools, and technical tutorials on Uyarcha.",
    },
    {
      route: "/about",
      title: "About Us | Uyarcha",
      description: "Learn about Uyarcha: our mission, technology stack, and dedication to high-quality technical blogging.",
    },
    {
      route: "/contact",
      title: "Contact Us | Uyarcha",
      description: "Get in touch with the Uyarcha team for collaborations, technical questions, and feedback.",
    },
    {
      route: "/privacy-policy",
      title: "Privacy Policy | Uyarcha",
      description: "Uyarcha privacy policy, cookie disclosures, and data protection guidelines.",
    },
    {
      route: "/certificates",
      title: "Certificates & Achievements | Uyarcha",
      description: "Verifiable certificates and professional technical credentials.",
    },
  ];

  // Fetch published articles from Supabase to prerender individual article pages
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: posts, error } = await supabase
        .from("posts")
        .select("slug, title, excerpt, seo_title, seo_description, image")
        .eq("status", "published");

      if (!error && posts) {
        for (const post of posts) {
          routes.push({
            route: `/article/${post.slug}`,
            title: `${post.seo_title || post.title} | Uyarcha`,
            description: post.seo_description || post.excerpt || "Read this article on Uyarcha.",
            ogImage: post.image,
            contentSnippet: post.excerpt || post.title,
          });
        }
      }
    } catch (e: any) {
      console.warn("Failed fetching articles during prerender:", e.message);
    }
  }

  for (const item of routes) {
    const routeDir = path.join(distDir, ...item.route.split("/").filter(Boolean));
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    let html = template;

    // Inject title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${item.title}</title>`);

    // Inject or update meta description
    if (html.includes('<meta name="description"')) {
      html = html.replace(
        /<meta name="description"[^>]*>/i,
        `<meta name="description" content="${item.description.replace(/"/g, '&quot;')}" />`
      );
    } else {
      html = html.replace(
        "</head>",
        `  <meta name="description" content="${item.description.replace(/"/g, '&quot;')}" />\n</head>`
      );
    }

    // Canonical link
    const canonical = `<link rel="canonical" href="${DOMAIN}${item.route}" />`;
    html = html.replace("</head>", `  ${canonical}\n</head>`);

    // Inject crawler-readable pre-rendered body placeholder into #root for bots without JS
    if (item.contentSnippet) {
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root"><div style="display:none" aria-hidden="true"><h1>${item.title}</h1><p>${item.description}</p></div></div>`
      );
    }

    fs.writeFileSync(path.join(routeDir, "index.html"), html);
  }

  console.log(`Prerender complete: generated static HTML snapshots for ${routes.length} routes.`);
}

prerender().catch((err) => {
  console.error("Prerender execution failed:", err);
  process.exit(0);
});
