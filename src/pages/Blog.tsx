import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { useSearchParams, Link } from "react-router-dom";
import { categories } from "@/lib/constants";
import PageLoader from "@/components/PageLoader";
import ErrorFallback from "@/components/ErrorFallback";
import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { usePublishedPosts } from "@/hooks/usePosts";

import type { Article } from "@/types/post";

/**
 * Feature 17: Load More Pagination
 * Feature 1: Debounced Search
 * Feature 15: Category filtering
 */

import { ArticleListSkeleton } from "@/components/ArticleSkeleton";

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const tagFilter = searchParams.get("tag");
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) {
        setSearchParams(prev => { prev.set("search", searchTerm); return prev; });
      } else {
        setSearchParams(prev => { prev.delete("search"); return prev; });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, setSearchParams]);

  // Feature 17: useInfiniteQuery for "Load More" from hooks layer
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = usePublishedPosts(categoryFilter, tagFilter, debouncedSearch);

  if (isLoading) {
    return (
        <Layout>
            <div className="container py-8">
                <div className="flex flex-col gap-12">
                   <ArticleListSkeleton count={4} />
                </div>
            </div>
        </Layout>
    );
  }
  if (isError) return <ErrorFallback message="We couldn't load the blog posts. Check your connection." onRetry={refetch} />;

  const allArticles = data?.pages.flat() || [];
  
  // Local filtering for tags (server only does title/excerpt/category currently)
  let filtered = allArticles;
  if (categoryFilter) {
      filtered = filtered.filter(a => a.category.toLowerCase() === categoryFilter.toLowerCase());
  }
  if (tagFilter) {
    filtered = filtered.filter(a => a.tags?.some(t => t.toLowerCase() === tagFilter.toLowerCase()));
  }

  return (
    <Layout>
      <section className="container py-8">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Blog Feed</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-display text-4xl font-black text-foreground mb-2">
              {categoryFilter ? categoryFilter : debouncedSearch ? `Search results` : "The Feed"}
            </h1>
            <p className="text-muted-foreground font-medium">Discover stories, thinking, and expertise.</p>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
            <input
              type="text"
              placeholder="Search by title, tag or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-12 border-b border-border pb-8">
          <Link to="/blog" className={`px-5 py-2 text-sm font-bold rounded-full border transition-all ${!categoryFilter ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" : "border-border text-muted-foreground hover:border-accent hover:text-accent"}`}>All Stories</Link>
          {categories.map(cat => (
            <Link key={cat} to={`/blog?category=${cat}`} className={`px-5 py-2 text-sm font-bold rounded-full border transition-all ${categoryFilter?.toLowerCase() === cat.toLowerCase() ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" : "border-border text-muted-foreground hover:border-accent hover:text-accent"}`}>{cat}</Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {filtered.length === 0 ? (
              <div className="bg-card border border-border border-dashed rounded-3xl p-24 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6 ring-8 ring-muted/20">
                  <Search size={40} className="text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">No matches found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                  We couldn't find any articles matching "{debouncedSearch || categoryFilter || 'your criteria'}". 
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 gap-10">
                    {filtered.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>

                {/* Feature 17: Load More Button */}
                {hasNextPage && (
                    <div className="pt-12 text-center">
                        <button 
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="inline-flex items-center justify-center px-12 py-4 bg-foreground text-background font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10 uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            {isFetchingNextPage ? (
                                <><Loader2 className="mr-2 animate-spin" size={16} /> Loading More</>
                            ) : (
                                "Load More Stories"
                            )}
                        </button>
                    </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-12">
            <Sidebar />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
