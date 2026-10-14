import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublishedPosts, getFeaturedPosts, getTrendingPosts, getPostBySlug, getRelatedPosts } from "@/queries/posts";

export const usePublishedPosts = (categoryFilter?: string | null, tagFilter?: string | null, debouncedSearch?: string | null) => {
  return useInfiniteQuery({
    queryKey: ['published-posts-infinite', categoryFilter, tagFilter, debouncedSearch],
    queryFn: ({ pageParam = null }: { pageParam: string | null | any }) => getPublishedPosts(pageParam, 10, categoryFilter, tagFilter, debouncedSearch),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      // Return the publish_date of the last item to use as cursor. If less than limit returned, no more pages.
      return ((lastPage as any[])?.length === 10) 
        ? lastPage[lastPage.length - 1].publish_date 
        : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 15, // 15 min memory cache optimization
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
};

export const useFeaturedPosts = () => {
  return useQuery({
    queryKey: ['featured-posts'],
    queryFn: getFeaturedPosts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useTrendingPosts = () => {
    return useQuery({
      queryKey: ['trending-posts'],
      queryFn: () => getTrendingPosts(5),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    });
};

export const useArticle = (slug: string) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => getPostBySlug(slug),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    enabled: !!slug
  });
};

export const useRelatedPosts = (category: string, currentId: string) => {
  return useQuery({
    queryKey: ['related-posts', category, currentId],
    queryFn: () => getRelatedPosts(category, currentId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    enabled: !!category && !!currentId
  });
};
