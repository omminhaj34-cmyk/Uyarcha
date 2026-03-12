import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { categories } from "@/data/articles";
import type { Article } from "@/data/articles";
import { Link } from "react-router-dom";

const Blog = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const tagFilter = searchParams.get("tag");
  const searchQuery = searchParams.get("search")?.toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const POSTS_PER_PAGE = 5;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then(r => r.json())
      .then(data => {
        const posts = Array.isArray(data) ? data : [];
        const visiblePosts = posts.filter(
          p => String(p.status || "").toLowerCase() === "published"
        );
        setArticles(visiblePosts);
        setLoading(false);
      })
      .catch(() => {
        setArticles([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 text-center">Loading articles...</div>
      </Layout>
    );
  }

  let filtered = articles || [];
  if (categoryFilter) {
    filtered = filtered.filter(a => a.category.toLowerCase() === categoryFilter.toLowerCase());
  }
  if (tagFilter) {
    filtered = filtered.filter(a => a.tags?.map(t => t.toLowerCase()).includes(tagFilter.toLowerCase()));
  }
  if (searchQuery) {
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchQuery) ||
      a.excerpt.toLowerCase().includes(searchQuery) ||
      a.category.toLowerCase().includes(searchQuery) ||
      a.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <Layout>
      <section className="container py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Blog</span>
          {categoryFilter && (
            <>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">{categoryFilter}</span>
            </>
          )}
          {tagFilter && (
            <>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">Tag: {tagFilter}</span>
            </>
          )}
        </nav>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {categoryFilter ? categoryFilter : tagFilter ? `Tag: ${tagFilter}` : searchQuery ? `Search: "${searchQuery}"` : "All Articles"}
        </h1>
        <p className="text-muted-foreground mb-8">{filtered.length} article{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link to="/blog" className={`px-4 py-2 text-sm rounded-full border transition-colors ${!categoryFilter ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent hover:text-accent"}`}>All</Link>
          {categories.map(cat => (
            <Link key={cat} to={`/blog?category=${cat}`} className={`px-4 py-2 text-sm rounded-full border transition-colors ${categoryFilter?.toLowerCase() === cat.toLowerCase() ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent hover:text-accent"}`}>{cat}</Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No articles found.</p>
            ) : (
              <div className="space-y-6">
                {paginated.map((article, i) => (
                  <div key={article.id || Math.random()}>
                    <ArticleCard article={article} />
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-border">
                    {page > 1 && (
                      <Link to={`/blog?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page - 1) }).toString()}`} className="px-4 py-2 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                        Previous
                      </Link>
                    )}
                    <span className="flex items-center text-sm font-medium">Page {page} of {totalPages}</span>
                    {page < totalPages && (
                      <Link to={`/blog?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page + 1) }).toString()}`} className="px-4 py-2 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <Sidebar />
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
