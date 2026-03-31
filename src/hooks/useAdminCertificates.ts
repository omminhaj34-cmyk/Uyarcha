import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminCertificates } from "@/queries/getAdminCertificates";
import { saveCertificate, deleteCertificate } from "@/mutations/certificateService";
import { isOnline } from "@/lib/config";
import { toast } from "sonner";
import type { Certificate } from "@/types/certificate";

export const useAdminCertificates = (isLoggedIn: boolean) => {
    const query = useQuery<Certificate[]>({
        queryKey: ['admin-certificates'],
        queryFn: getAdminCertificates,
        enabled: isLoggedIn,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000, 
        refetchOnWindowFocus: false,
    });
    
    return {
        ...query,
        data: query.data ?? []
    };
};

export const useDeleteCertificate = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteCertificate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
            toast.success("Certificate deleted.");
        },
        onError: (err: any) => {
            toast.error("Deletion failed", { description: err.message });
        }
    });
};

export const useSaveCertificate = (editingCert: Certificate | null, closeModal: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data, imageFile }: { data: Partial<Certificate>, imageFile: File | null }) => {
            if (!isOnline()) throw new Error("Network issue. Try again.");
            
            const result = await saveCertificate(data, imageFile);
            if (!result || !result.success) throw new Error(result?.message || "Failed to save certificate");
            return result;
        },
        onMutate: async ({ data, imageFile }) => {
            await queryClient.cancelQueries({ queryKey: ['admin-certificates'] });
            const previousCerts = queryClient.getQueryData<Certificate[]>(['admin-certificates']);
            
            const optimisticDate = new Date().toISOString();
            const optimisticCert: Certificate = {
                id: editingCert ? editingCert.id : `temp-${Date.now()}`,
                title: data.title || "Untitled",
                issuer: data.issuer || "Unknown",
                description: data.description || null,
                verify_url: data.verify_url || null,
                issue_date: data.issue_date || null,
                image: imageFile ? URL.createObjectURL(imageFile) : data.image || null,
                created_at: editingCert ? editingCert.created_at : optimisticDate,
            };

            queryClient.setQueryData<Certificate[]>(['admin-certificates'], old => {
                if (!old) return [];
                if (editingCert) {
                    return old.map(p => p.id === editingCert.id ? { ...p, ...optimisticCert } : p);
                }
                return [optimisticCert, ...old];
            });

            closeModal();
            return { previousCerts };
        },
        onError: (err: any, variables, context) => {
            if (context?.previousCerts) {
                queryClient.setQueryData(['admin-certificates'], context.previousCerts);
            }
            toast.error("System Error", { description: err.message });
        },
        onSettled: () => {
             queryClient.invalidateQueries({ queryKey: ['admin-certificates'] });
             queryClient.invalidateQueries({ queryKey: ['certificates'] });
        },
        onSuccess: () => {
             toast.success(editingCert ? "Certificate updated!" : "Certificate added!");
        }
    });
};
