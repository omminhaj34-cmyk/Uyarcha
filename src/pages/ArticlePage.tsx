import { useParams, Link } from "react-router-dom";
import { Share2, Facebook, Twitter, Linkedin, Clock, User, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import type { Article } from "@/data/articles";
import { getImageUrl } from "@/lib/api";
import { Helmet } from "react-helmet-async";
import ArticleCard from "@/components/ArticleCard";

const ArticlePage = () => {

  const { slug } = useParams<{ slug: string }>()

  const [article, setArticle] = useState<Article | null>(null)
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {

    async function load() {

      try {

        const res = await fetch("/api/posts")

        if (!res.ok) {

          throw new Error()

        }

        const data = await res.json()

        const posts = Array.isArray(data) ? data : []

        const found = posts.find(p => p.slug === slug)

        setArticle(found || null)

        setAllArticles(posts)

      } catch {

        setError(true)

      }

      setLoading(false)

    }

    if (slug) {

      load()

    }

  }, [slug])

  /* Loading */

  if (loading) {

    return (

      <Layout>

        <div className="container py-20 text-center">

          Loading article...

        </div>

      </Layout>

    )

  }

  /* Error */

  if (error) {

    return (

      <Layout>

        <div className="container py-20 text-center">

          Failed to load article

        </div>

      </Layout>

    )

  }

  /* Missing */

  if (!article) {

    return (

      <Layout>

        <div className="container py-20 text-center">

          <h1 className="text-3xl font-bold mb-4">

            Article Not Found

          </h1>

          <Link to="/blog">

            ← Back to Blog

          </Link>

        </div>

      </Layout>

    )

  }

  /* Safe defaults */

  const safeTitle = article?.title || "Untitled"

  const safeContent = article?.content || "<p>No content available</p>"

  const safeCategory = article?.category || "General"

  const safeAuthor = article?.author || "Admin"

  const safeImage = article?.image || ""

  const safeTags = Array.isArray(article?.tags) ? article.tags : []

  const safeDate = article?.date || new Date().toISOString()

  const dateStr = new Date(safeDate).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )

  /* Related posts safe */

  const relatedPosts = (allArticles || [])
    .filter(p => {
      if (!article) return false
      return (
        p.id !== article.id &&
        String(p.status || "").toLowerCase() === "published" &&
        (
          p.category === article.category ||
          (Array.isArray(p.tags) && safeTags.some(t => p.tags.includes(t)))
        )
      )
    })

    .slice(0, 3)

  /* TOC safe */

  const headings: { id: string, text: string }[] = []

  if (safeContent) {

    const regex = /<h2 id="([^"]+)">([^<]+)<\/h2>/g

    let match

    while ((match = regex.exec(safeContent)) !== null) {

      headings.push({

        id: match[1],

        text: match[2]

      })

    }

  }

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : ""

  return (

    <Layout>

      <Helmet>

        <title>

          {article?.metaTitle || `${safeTitle} | Uyarcha`}

        </title>

        <meta
          name="description"
          content={article?.metaDescription || article?.excerpt || ""}
        />

        <meta
          property="og:image"
          content={getImageUrl(safeImage)}
        />

      </Helmet>

      <article className="container py-8">

        {/* Breadcrumb */}

        <nav className="text-sm mb-6">

          <Link to="/">Home</Link>

          <span className="mx-2">/</span>

          <Link to="/blog">Blog</Link>

          <span className="mx-2">/</span>

          <span>{safeCategory}</span>

        </nav>

        {/* Header */}

        <header className="mb-8 max-w-3xl">

          <span className="px-3 py-1 text-xs bg-accent text-white rounded">

            {safeCategory}

          </span>

          <h1 className="text-4xl font-bold mt-4 mb-4">

            {safeTitle}

          </h1>

          <div className="flex gap-4 text-sm">

            <span className="flex gap-1">

              <User className="w-4" />

              {safeAuthor}

            </span>

            <span className="flex gap-1">

              <Calendar className="w-4" />

              {dateStr}

            </span>

            <span className="flex gap-1">

              <Clock className="w-4" />

              {article?.readTime || "5 min"}

            </span>

          </div>

        </header>

        {/* Image */}

        <div className="mb-8">

          <img

            src={getImageUrl(safeImage)}

            alt={safeTitle}

            onError={(e) => {

              e.currentTarget.src = "/placeholder.svg"

            }}

            className="w-full rounded-lg"

          />

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">

            {/* TOC */}

            {headings.length > 0 && (

              <div className="bg-secondary p-5 rounded mb-8">

                <h3 className="font-bold mb-3">

                  Table of Contents

                </h3>

                {headings.map((h, i) => (

                  <a

                    key={h.id}

                    href={`#${h.id}`}

                    className="block text-sm"

                  >

                    {i + 1}. {h.text}

                  </a>

                ))}

              </div>

            )}

            {/* Content */}

            <div

              className="article-content"

              dangerouslySetInnerHTML={{

                __html: safeContent

              }}

            />

            {/* Related */}

            {relatedPosts.length > 0 && (

              <div className="mt-10">

                <h3 className="text-2xl mb-6">

                  Related Articles

                </h3>

                <div className="grid md:grid-cols-2 gap-6">

                  {relatedPosts.map(p => (

                    <ArticleCard

                      key={p.id}

                      article={p}

                      variant="compact"

                    />

                  ))}

                </div>

              </div>

            )}

          </div>

          <Sidebar />

        </div>

      </article>

    </Layout>

  )

}

export default ArticlePage