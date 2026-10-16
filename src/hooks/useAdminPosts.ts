import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllAdminPosts } from "@/queries/adminPosts";
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
        mutationFn: async ({ data, imageFile }: { data: any; imageFile: File | null }) => {
            if (!isOnline()) {
                throw new Error("Network offline. Please check your internet connection and try again.");
            }
            
            const result = editingPost && editingPost.id
                ? await updateExistingPost(editingPost.id, data, imageFile) 
                : await publishPost(data, imageFile);
            
            if (!result.success) {
                throw new Error(result.message || "Failed to save post to database.");
            }
            return result;
        },
        onSuccess: () => {
            // Invalidate all post-related queries so dashboard metrics & tables update immediately
            queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
            queryClient.invalidateQueries({ queryKey: ['published-posts'] });
            queryClient.invalidateQueries({ queryKey: ['published-posts-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['featured-posts'] });
            queryClient.invalidateQueries({ queryKey: ['trending-posts'] });
            
            toast.success(editingPost ? "Story updated successfully!" : "Story published successfully!");
            // Close the editor modal ONLY after database confirms success
            closeModal();
        },
        onError: (err: any) => {
            console.error("Save post error:", err);
            toast.error("Publishing Failed", {
                description: err.message || "An unexpected error occurred while saving to the database.",
            });
            // Modal remains open on error to preserve form inputs
        }
    });
};
