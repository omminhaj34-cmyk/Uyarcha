import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categories, allTags } from "@/data/articles";
import type { Article } from "@/data/articles";
import { getImageUrl } from "@/lib/api";

const Sidebar = () => {
  const [recentPosts, setRecentPosts] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then(res => res.json())
      .then(data => {
        const posts = Array.isArray(data) ? data : [];
        const published = posts.filter(
          p => String(p.status || "").toLowerCase() === "published"
        );
        setRecentPosts(published.slice(0, 4));
      })
      .catch(() => setRecentPosts([]));
  }, []);

  return (
    <aside className="space-y-8">

      {/* Recent Posts */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4 text-card-foreground">Recent Posts</h3>
        {(recentPosts || []).map(post => (
          <Link key={post.id || Math.random()} to={`/article/${post.slug}`} className="flex gap-3 group">
            <img src={getImageUrl(post.image)} onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} alt={post.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" loading="lazy" />
            <div>
              <h4 className="text-sm font-medium text-card-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">{post.title || 'Untitled'}</h4>
              <span className="text-xs text-muted-foreground mt-1 block">{post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : 'Unknown Date'}</span>
            </div>
          </Link>
        ))}
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

      {/* Popular Tags */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4 text-card-foreground">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Link key={tag} to={`/blog?tag=${tag}`} className="px-2 py-1 text-xs font-medium bg-muted/50 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              #{tag}
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

    </aside>
  );
};

export default Sidebar;
