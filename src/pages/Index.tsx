import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import type { Article } from "@/data/articles";

const Index = () => {
  const [featured, setFeatured] = useState<Article[]>([]);
  const [recent, setRecent] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        const posts = Array.isArray(data) ? data : [];

        // Step 1, 4 & 9: Safe status filtering
        const publishedPosts = posts.filter(
          p => String(p.status || "").toLowerCase() === "published"
        );

        // Step 2 & 8: Fix featured default and logic
        const featuredPosts = publishedPosts.filter(
          p => (p.featured === true || (p as any).featured === 1)
        ).slice(0, 2);

        setFeatured(featuredPosts);
        setRecent(publishedPosts.slice(0, 6));
      })
      .catch(() => {
        setFeatured([]);
        setRecent([]);
      });
  }, []);

  return (
    <Layout>
      {/* SEO - would use react-helmet in production */}
      <section className="container py-8">
        {/* Featured Articles */}
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {(featured || []).map(article => (
              <ArticleCard key={article.id || Math.random()} article={article} variant="featured" />
            ))}
          </div>
        ) : (
          <div className="w-full mb-12 bg-card border border-border rounded-xl p-8 text-center text-muted-foreground animate-pulse">
            No featured articles have been published yet.
          </div>
        )}


        {/* Latest Articles + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Latest Articles</h2>
            {recent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(recent || []).map(article => (
                  <ArticleCard key={article.id || Math.random()} article={article} />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground animate-pulse">
                No latest articles have been published yet. Please check back later!
              </div>
            )}
          </div>
          <Sidebar />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
