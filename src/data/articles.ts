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
  status?: "draft" | "published" | "scheduled";
  metaTitle?: string;
  metaDescription?: string;
  publishDate?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const categories = [
  "Technology", "Programming", "AI", "Productivity", "Education", "Business", "Marketing"
];

export const allTags = [
  "React", "Node.js", "TypeScript", "Python", "Machine Learning", "SEO", "Web Development", "Design"
];

import { getPosts, getPost } from "@/lib/api";

// Base hook for fetching all articles
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: getPosts
  });
};

export const usePublishedArticles = () => {
  const { data: articles = [], ...rest } = useArticles();
  const published = articles.filter(article => String(article.status || "").toLowerCase() === 'published');
  return { data: published, ...rest };
};

export const useFeaturedArticles = () => {
  const { data: articles = [], ...rest } = usePublishedArticles();
  const featured = articles.filter(article => article.featured === true || (article as any).featured === 1);
  return { data: featured.slice(0, 4), ...rest };
};

export const useRecentArticles = (count: number = 3) => {
  const { data: articles = [], ...rest } = usePublishedArticles();
  const sorted = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { data: sorted.slice(0, count), ...rest };
};

export const useArticleBySlug = (slug: string | undefined) => {
  const query = useQuery({
    queryKey: ['article', slug],
    queryFn: () => getPost(slug as string),
    enabled: !!slug
  });
  return { data: query.data, ...query };
};

export const useRelatedArticles = (category: string, currentId: string) => {
  const { data: articles = [], ...rest } = usePublishedArticles();
  const related = articles
    .filter(a => a.category.toLowerCase() === category.toLowerCase() && a.id !== currentId)
    .slice(0, 2);
  return { data: related, ...rest };
};
