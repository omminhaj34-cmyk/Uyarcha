import { useQuery } from "@tanstack/react-query";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  featured?: boolean;
  readTime: string;
  status?: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
}

export const categories = [
  "Technology", "Programming", "AI", "Productivity", "Education"
];

// Base hook for fetching all articles
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json() as Promise<Article[]>;
    }
  });
};

export const usePublishedArticles = () => {
  const { data: articles = [], ...rest } = useArticles();
  const published = articles.filter(article => article.status !== 'draft');
  return { data: published, ...rest };
};

export const useFeaturedArticles = () => {
  const { data: articles = [], ...rest } = usePublishedArticles();
  const featured = articles.filter(article => article.featured);
  // Optional: return only top 4 if needed, but original returned all featured or top 4
  return { data: featured.slice(0, 4), ...rest };
};

export const useRecentArticles = (count: number = 3) => {
  const { data: articles = [], ...rest } = usePublishedArticles();
  const sorted = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { data: sorted.slice(0, count), ...rest };
};

export const useArticleBySlug = (slug: string | undefined) => {
  const { data: articles = [], ...rest } = useArticles();
  return { data: articles.find(a => a.slug === slug), ...rest };
};

export const useRelatedArticles = (category: string, currentId: string) => {
  const { data: articles = [], ...rest } = usePublishedArticles();
  const related = articles
    .filter(a => a.category.toLowerCase() === category.toLowerCase() && a.id !== currentId)
    .slice(0, 2);
  return { data: related, ...rest };
};
