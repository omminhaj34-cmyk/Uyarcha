import { Link } from "react-router-dom";
import { getRecentArticles, categories } from "@/data/articles";

const Sidebar = () => {
  const recentPosts = getRecentArticles(4);

  return (
    <aside className="space-y-8">
      {/* Ad slot */}
      <div className="ad-slot h-[250px]">Ad Space (300×250)</div>

      {/* Recent Posts */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4 text-card-foreground">Recent Posts</h3>
        <div className="space-y-4">
          {recentPosts.map(post => (
            <Link key={post.id} to={`/article/${post.slug}`} className="flex gap-3 group">
              <img src={post.image} alt={post.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" loading="lazy" />
              <div>
                <h4 className="text-sm font-medium text-card-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">{post.title}</h4>
                <span className="text-xs text-muted-foreground mt-1 block">{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4 text-card-foreground">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Link key={cat} to={`/blog?category=${cat}`} className="px-3 py-1.5 text-xs font-medium rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors">
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-accent/10 rounded-lg border border-accent/20 p-5">
        <h3 className="font-display text-lg font-bold mb-2 text-foreground">Stay Updated</h3>
        <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for the latest articles.</p>
        <form onSubmit={e => e.preventDefault()} className="space-y-2">
          <input type="email" placeholder="Enter your email" className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <button type="submit" className="w-full px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Subscribe</button>
        </form>
      </div>

      {/* Another Ad */}
      <div className="ad-slot h-[250px] sticky top-32">Ad Space (300×250)</div>
    </aside>
  );
};

export default Sidebar;
