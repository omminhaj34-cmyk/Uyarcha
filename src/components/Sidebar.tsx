import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { categories, allTags, getPublishedPosts, getTrendingPosts } from "@/lib/db";

import { TrendingUp, Eye } from "lucide-react";

const Sidebar = () => {
  const { data: recentPosts = [] } = useQuery({
    queryKey: ['recent-posts-sidebar'],
    queryFn: () => getPublishedPosts()
  });

  const { data: trendingPosts = [] } = useQuery({
    queryKey: ['trending-posts-sidebar'],
    queryFn: () => getTrendingPosts(5)
  });

  return (
    <aside className="space-y-8">
      {/* Feature 4: Trending Posts */}
      {trendingPosts.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-5">
           <div className="flex items-center gap-2 mb-4 text-accent">
               <TrendingUp size={18} />
               <h3 className="font-display text-lg font-bold text-card-foreground">Trending Now</h3>
           </div>
           <div className="space-y-4">
             {trendingPosts.map(post => (
               <Link key={post.id} to={`/article/${post.slug}`} className="group block">
                 <h4 className="text-sm font-semibold text-card-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-1">{post.title}</h4>
                 <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                     <span>{post.category}</span>
                     <span>•</span>
                     <div className="flex items-center gap-1">
                         <Eye size={10} />
                         <span>{post.views || 0}</span>
                     </div>
                 </div>
               </Link>
             ))}
           </div>
        </div>
      )}

      {/* Recent Posts */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4 text-card-foreground">Recent Posts</h3>
        <div className="space-y-4">
            {(recentPosts || []).map(post => (
            <Link key={post.id || Math.random()} to={`/article/${post.slug}`} className="flex gap-3 group">
                <img src={post.image || '/placeholder.svg'} onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} alt={post.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" loading="lazy" />
                <div>
                <h4 className="text-sm font-medium text-card-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">{post.title || 'Untitled'}</h4>
                <span className="text-xs text-muted-foreground mt-1 block">{post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : 'Unknown Date'}</span>
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

    </aside>
  );
};

export default Sidebar;
