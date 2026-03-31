import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { getPostBySlug } from "@/queries/posts";
import { incrementViews, getRelatedPosts } from "@/lib/db";
import { getImageUrl } from "@/lib/supabase";
import PageLoader from "@/components/PageLoader";
import ErrorFallback from "@/components/ErrorFallback";
import { Facebook, Linkedin, Link2, Clock, Eye, Calendar, User } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import { toast } from "sonner";


const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, isError, refetch } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug || ""),
    enabled: !!slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['related-posts', post?.category, post?.id],
    queryFn: () => getRelatedPosts(post?.category || "", post?.id || ""),
    enabled: !!post,
  });

  // Feature 2: View Counter with Session Guard
  useEffect(() => {
    if (post?.id) {
      const viewedKey = `viewed_${post.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        incrementViews(post.id);
        sessionStorage.setItem(viewedKey, 'true');
      }
    }
  }, [post?.id]);

  if (isLoading) return <PageLoader message="Opening the article..." />;
  
  if (isError || (!isLoading && !post)) {
    return (
        <Layout>
            <ErrorFallback 
                message="We couldn't find the article you're looking for." 
                onRetry={refetch}
            />
        </Layout>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : "";
  const shareTitle = post?.title || "";

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined') {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
    }
  };

  // Feature 8: SEO Automation
  const seoTitle = post?.seo_title || `${post?.title || "Article"} | Uyarcha`;
  const seoDescription = post?.seo_description || post?.excerpt || "";

  return (
    <Layout>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {post.seo_keywords && <meta name="keywords" content={post.seo_keywords} />}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={post.image || ""} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="author" content={post?.author || "Uyarcha"} />
      </Helmet>

      <article className="container py-8 max-w-7xl">
        <nav className="text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-accent transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium truncate">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <header className="space-y-6">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">{post.category}</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">{post.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                    <User size={16} />
                    <span className="font-medium text-foreground">{post?.author || "Uyarcha"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(post?.publish_date || post?.date || new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{post?.readTime || "Read"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{post.views || 0} views</span>
                </div>
              </div>

              {/* Feature 11: Share Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={copyToClipboard} className="p-2 rounded-full border border-border hover:bg-muted transition-colors" title="Copy link">
                    <Link2 size={18} />
                </button>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border hover:bg-black hover:text-white transition-all flex items-center justify-center">
                    <XIcon className="w-[18px] h-[18px]" />
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border hover:text-blue-600 hover:border-blue-600 transition-all">
                    <Facebook size={18} />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border hover:text-blue-700 hover:border-blue-700 transition-all">
                    <Linkedin size={18} />
                </a>
              </div>
            </header>

            <div className="rounded-2xl overflow-hidden aspect-video shadow-2xl">
              <img 
                src={post.image || "/placeholder.svg"} 
                alt={post.title} 
                className="w-full h-full object-cover bg-muted" 
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                loading="eager"
              />
            </div>

            <div 
              className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-display prose-headings:font-bold 
                prose-p:leading-relaxed prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />


            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-12 border-t border-border">
                {post.tags.map(tag => (
                  <Link key={tag} to={`/blog?tag=${tag}`} className="px-3 py-1 bg-muted rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Feature 3: Related Articles */}
            <section className="pt-16 mt-16 border-t border-border">
                <h3 className="font-display text-2xl font-bold mb-8">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relatedPosts.slice(0, 4).map(p => (
                        <ArticleCard key={p.id} article={p} />
                    ))}
                </div>
            </section>
          </div>
          
          <div className="space-y-12">
            <Sidebar />
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default ArticlePage;