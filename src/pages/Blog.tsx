import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { usePublishedArticles, categories } from "@/data/articles";
import { Link } from "react-router-dom";

const Blog = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const searchQuery = searchParams.get("search")?.toLowerCase();

  const { data: articles = [] } = usePublishedArticles();

  let filtered = articles;
  if (categoryFilter) {
    filtered = filtered.filter(a => a.category.toLowerCase() === categoryFilter.toLowerCase());
  }
  if (searchQuery) {
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchQuery) ||
      a.excerpt.toLowerCase().includes(searchQuery) ||
      a.category.toLowerCase().includes(searchQuery)
    );
  }

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
        </nav>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {categoryFilter ? categoryFilter : searchQuery ? `Search: "${searchQuery}"` : "All Articles"}
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
                {filtered.map((article, i) => (
                  <div key={article.id}>
                    <ArticleCard article={article} />
                  </div>
                ))}
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
