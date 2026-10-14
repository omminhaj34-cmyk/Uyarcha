import { Skeleton } from "./ui/skeleton";

export const ArticleSkeleton = () => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden p-0 animate-pulse">
      <div className="aspect-[16/9] w-full bg-muted" />
      <div className="p-5 space-y-4">
        <div className="h-3 w-1/4 bg-muted rounded" />
        <div className="space-y-2">
            <div className="h-6 w-full bg-muted rounded" />
            <div className="h-6 w-2/3 bg-muted rounded" />
        </div>
        <div className="space-y-2 pt-2">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-5/6 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
            <div className="h-4 w-1/3 bg-muted rounded" />
            <div className="h-4 w-4 bg-muted rounded-full" />
            <div className="h-4 w-1/4 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
};

export const ArticleGridSkeleton = ({ count = 6, cols = 3 }: { count?: number; cols?: number }) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-8 w-full`}>
            {Array.from({ length: count }).map((_, i) => (
                <ArticleSkeleton key={i} />
            ))}
        </div>
    );
};

export const ArticleListSkeleton = ArticleGridSkeleton;
