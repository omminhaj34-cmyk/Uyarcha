import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFeaturedPosts, getPublishedPosts, getTrendingPosts } from "@/queries/posts";
import PageLoader from "@/components/PageLoader";
import ErrorFallback from "@/components/ErrorFallback";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Zap } from "lucide-react";
import type { Article } from "@/types/post";
import { useEffect } from "react";


import { ArticleListSkeleton } from "@/components/ArticleSkeleton";

const Index = () => {
  console.log("Index mounted");
  const queryClient = useQueryClient();

  // Prefetch the paginated blog list slightly after mount completely in the background
  useEffect(() => {
     queryClient.prefetchInfiniteQuery({
         queryKey: ['published-posts-infinite', null, null, null],
         queryFn: ({ pageParam = null }) => getPublishedPosts(pageParam as string | null, 10, null, null, null),
         initialPageParam: null as string | null
     });
  }, [queryClient]);

  const { data: featured = [], isLoading: isFeaturedLoading, error: featuredError } = useQuery({
    queryKey: ['featured-posts'],
    queryFn: getFeaturedPosts,
  });

  const { data: latest = [] as Article[], isLoading: isLatestLoading, error: latestError, refetch: refetchLatest } = useQuery({
    queryKey: ['latest-posts-home'],
    queryFn: () => getPublishedPosts(null, 10),
  });

  const { data: trending = [], isLoading: isTrendingLoading, error: trendingError } = useQuery({
    queryKey: ['trending-posts-home'],
    queryFn: () => getTrendingPosts(4),
  });

  if (isFeaturedLoading || isLatestLoading || isTrendingLoading) {
    return (
        <Layout>
            <div className="container py-8 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2"><ArticleListSkeleton count={1} /></div>
                    <div className="space-y-6"><ArticleListSkeleton count={2} /></div>
                </div>
                <div className="space-y-8">
                    <ArticleListSkeleton count={3} />
                </div>
            </div>
        </Layout>
    );
  }

  if (featuredError || latestError || trendingError) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Failed to load content</h2>
          <p className="text-muted-foreground mb-8">Please check your connection and try again.</p>
          <button 
            onClick={() => { refetchLatest(); }}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const mainFeatured = featured[0];
  const sideFeatured = featured.slice(1, 3);

  return (
    <Layout>
      <section className="container py-8 space-y-16">
        
        {/* Feature 5: Hero Section (Featured Articles) */}
        {mainFeatured && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
                <ArticleCard article={mainFeatured} variant="featured" />
            </div>
            <div className="space-y-6 flex flex-col justify-between">
                {sideFeatured.map(post => (
                    <ArticleCard key={post.id} article={post} />
                ))}
                {!sideFeatured.length && latest.slice(0, 2).map(post => (
                     <ArticleCard key={post.id} article={post} />
                ))}
            </div>
          </div>
        )}

        {/* Feature 4: Trending Grid */}
        {trending.length > 0 && (
            <div className="space-y-8">
                <div className="flex items-center gap-3 text-accent border-b-2 border-accent/10 pb-4">
                    <TrendingUp size={24} />
                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Trending Now</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trending.map((post, idx) => (
                        <div key={post.id} className="relative group flex gap-4 p-4 rounded-2xl hover:bg-muted transition-all">
                            <span className="text-4xl font-black text-muted-foreground/20 group-hover:text-accent/30 transition-colors">0{idx + 1}</span>
                            <div className="flex flex-col gap-1 pr-2">
                                <Link to={`/article/${post.slug}`} className="font-bold text-foreground group-hover:text-accent transition-colors leading-snug line-clamp-2">{post.title}</Link>
                                <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">{post.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
               <div className="flex items-center gap-3">
                  <Zap size={20} className="text-orange-500" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Latest Updates</h2>
               </div>
               <Link to="/blog" className="text-xs font-black uppercase tracking-widest text-accent hover:translate-x-1 transition-transform flex items-center gap-2">
                 Browse All <ArrowRight size={14} />
               </Link>
            </div>
            
            {latest.length === 0 ? (
               <ErrorFallback message="No articles found. Be the first to publish!" onRetry={refetchLatest} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {latest.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
            )}

            <div className="pt-8 text-center">
               <Link to="/blog" className="inline-flex items-center justify-center px-10 py-4 bg-foreground text-background font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10 uppercase tracking-widest text-sm">
                  Load More Articles
               </Link>
            </div>
          </div>
          
          <div className="space-y-12 lg:sticky lg:top-24 h-fit">
            <Sidebar />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
