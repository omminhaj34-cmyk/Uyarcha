import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { getFeaturedArticles, getRecentArticles, articles } from "@/data/articles";

const Index = () => {
  const featured = getFeaturedArticles();
  const recent = getRecentArticles(6);

  return (
    <Layout>
      {/* SEO - would use react-helmet in production */}
      <section className="container py-8">
        {/* Featured Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {featured.map(article => (
            <ArticleCard key={article.id} article={article} variant="featured" />
          ))}
        </div>

        {/* Ad between sections */}
        <div className="ad-slot h-[90px] mb-12">Advertisement Space — Leaderboard (728×90)</div>

        {/* Latest Articles + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Latest Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recent.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
          <Sidebar />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
