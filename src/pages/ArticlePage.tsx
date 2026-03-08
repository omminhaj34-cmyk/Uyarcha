import { useParams, Link } from "react-router-dom";
import { Share2, Facebook, Twitter, Linkedin, Clock, User, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import Sidebar from "@/components/Sidebar";
import { getArticleBySlug } from "@/data/articles";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug || "");

  if (!article) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
          <Link to="/blog" className="text-accent hover:underline">← Back to Blog</Link>
        </div>
      </Layout>
    );
  }

  const dateStr = new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Extract headings for TOC
  const headingRegex = /<h2 id="([^"]+)">([^<]+)<\/h2>/g;
  const headings: { id: string; text: string }[] = [];
  let match;
  while ((match = headingRegex.exec(article.content)) !== null) {
    headings.push({ id: match[1], text: match[2] });
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Layout>
      <article className="container py-8" itemScope itemType="https://schema.org/BlogPosting">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-accent transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{article.category}</span>
        </nav>

        {/* Header */}
        <header className="max-w-3xl mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground mb-4">{article.category}</span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4" itemProp="headline">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /><span itemProp="author">{article.author}</span></span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><time dateTime={article.date} itemProp="datePublished">{dateStr}</time></span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{article.readTime}</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-xl overflow-hidden mb-8 max-w-4xl">
          <img src={article.image} alt={article.title} className="w-full aspect-[2/1] object-cover" itemProp="image" />
        </div>

        {/* Ad after image */}
        <div className="ad-slot h-[90px] mb-8 max-w-4xl">Advertisement Space (728×90)</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="bg-secondary rounded-lg p-5 mb-8">
                <h3 className="font-display font-bold text-foreground mb-3">Table of Contents</h3>
                <ol className="space-y-1.5">
                  {headings.map((h, i) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                        {i + 1}. {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Article Content */}
            <div className="article-content" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: article.content }} />

            {/* Ad after content */}
            <div className="ad-slot h-[250px] my-8">Advertisement Space (336×280)</div>

            {/* Share Buttons */}
            <div className="border-t border-border pt-6 mt-8">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground"><Share2 className="w-4 h-4" /> Share:</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Share on Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Share on Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Share on LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <Sidebar />
        </div>
      </article>
    </Layout>
  );
};

export default ArticlePage;
