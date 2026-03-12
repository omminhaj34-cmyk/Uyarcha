import { Link } from "react-router-dom";
import type { Article } from "@/data/articles";
import { getImageUrl } from "@/lib/api";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
}

const ArticleCard = ({ article, variant = "default" }: ArticleCardProps) => {
  const dateStr = new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  if (variant === "featured") {
    return (
      <Link to={`/article/${article.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-xl aspect-[16/9]">
          <img src={getImageUrl(article.image) || '/placeholder.svg'} alt={article.title} onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground mb-3">{article.category}</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground leading-tight mb-2">{article.title}</h2>
            <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
              <span>{article.author}</span>
              <span>•</span>
              <span>{dateStr}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={`/article/${article.slug}`} className="group flex gap-4 items-start">
        <img src={getImageUrl(article.image) || '/placeholder.svg'} alt={article.title} onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" loading="lazy" />
        <div>
          <span className="text-xs font-medium text-accent">{article.category}</span>
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-accent transition-colors leading-snug mt-1">{article.title}</h3>
          <span className="text-xs text-muted-foreground mt-1 block">{dateStr}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.slug}`} className="group block bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[16/9] overflow-hidden">
        <img src={getImageUrl(article.image) || '/placeholder.svg'} alt={article.title} onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="p-5">
        <span className="text-xs font-semibold text-accent">{article.category}</span>
        <h3 className="font-display text-xl font-bold text-card-foreground mt-2 mb-2 leading-snug group-hover:text-accent transition-colors">{article.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{article.author}</span>
          <span>•</span>
          <span>{dateStr}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
