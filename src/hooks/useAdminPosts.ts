import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllAdminPosts, getPostContentForAdmin } from "@/queries/adminPosts";
import { publishPost, updateExistingPost, deletePost } from "@/mutations/posts";
import { isOnline } from "@/lib/config";
import { toast } from "sonner";
import type { Article } from "@/types/post";

export const useAdminPosts = (isLoggedIn: boolean) => {
    return useQuery<Partial<Article>[]>({
        queryKey: ['admin-posts'],
        queryFn: getAllAdminPosts,
        enabled: isLoggedIn,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, 
        refetchOnWindowFocus: false,
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            queryClient.invalidateQueries({ queryKey: ['published-posts'] });
            queryClient.invalidateQueries({ queryKey: ['published-posts-infinite'] });
            toast.success("Post permanently deleted.");
        },
        onError: (err: any) => {
            toast.error("Deletion failed", { description: err.message });
        }
    });
};

export const useSavePost = (editingPost: Partial<Article> | null, closeModal: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data, imageFile }: { data: any, imageFile: File | null }) => {
            if (!isOnline()) throw new Error("Network issue. Try again.");
            
            const result = editingPost && editingPost.id
                ? await updateExistingPost(editingPost.id, data, imageFile, true) 
                : await publishPost(data, imageFile, true);
            
            if (!result.success) throw new Error(result.message);
            return result;
        },
        onMutate: async ({ data, imageFile }) => {
            await queryClient.cancelQueries({ queryKey: ['admin-posts'] });
            const previousPosts = queryClient.getQueryData<Partial<Article>[]>(['admin-posts']);
            
            const optimisticDate = new Date().toISOString();
            const optimisticPost: Article = {
                id: editingPost ? (editingPost.id as string) : `temp-${Date.now()}`,
                title: data.title || "Untitled",
                slug: data.slug || `temp-${Date.now()}`,
                content: data.content || "",
                excerpt: data.excerpt || "",
                category: data.category || "General",
                views: editingPost ? (editingPost.views || 0) : 0,
                status: data.status || 'draft',
                featured: data.featured || false,
                image: imageFile ? URL.createObjectURL(imageFile) : data.image,
                publish_date: data.publish_date || optimisticDate,
                created_at: editingPost ? (editingPost.created_at as string) : optimisticDate,
            };

            queryClient.setQueryData<Partial<Article>[]>(['admin-posts'], old => {
                if (!old) return [];
                if (editingPost) {
                    return old.map(p => p.id === editingPost.id ? { ...p, ...optimisticPost } : p);
                }
                return [optimisticPost, ...old];
            });

            closeModal();
            return { previousPosts };
        },
        onError: (err: any, newPost, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(['admin-posts'], context.previousPosts);
            }
            toast.error("System Error - Rolling back", { description: err.message });
        },
        onSettled: () => {
             // Invalidate to let the DB truth reconcile completely
             queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
             queryClient.invalidateQueries({ queryKey: ['published-posts'] });
             queryClient.invalidateQueries({ queryKey: ['published-posts-infinite'] });
             queryClient.invalidateQueries({ queryKey: ['featured-posts'] });
             queryClient.invalidateQueries({ queryKey: ['trending-posts'] });
        },
        onSuccess: () => {
             toast.success(editingPost ? "Story updated!" : "Story published!");
        }
    });
};
