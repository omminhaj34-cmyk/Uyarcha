import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminCertificates } from "@/queries/getAdminCertificates";
import { saveCertificate, deleteCertificate } from "@/mutations/certificateService";
import { isOnline } from "@/lib/config";
import { toast } from "sonner";
import type { Certificate } from "@/types/certificate";

export const useAdminCertificates = (isLoggedIn: boolean) => {
  const query = useQuery<Certificate[]>({
    queryKey: ["admin-certificates"],
    queryFn: getAdminCertificates,
    enabled: isLoggedIn,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    data: query.data ?? [],
  };
};

export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate deleted.");
    },
    onError: (err: any) => {
      toast.error("Deletion failed", { description: err.message });
    },
  });
};

export const useSaveCertificate = (
  editingCert: Certificate | null,
  closeModal: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      imageFile,
    }: {
      data: Partial<Certificate>;
      imageFile: File | null;
    }) => {
      if (!isOnline()) throw new Error("Network issue. Please check your connection and try again.");

      const result = await saveCertificate(data, imageFile);
      if (!result || !result.success) {
        throw new Error(result?.message || "Failed to save certificate.");
      }
      return result.data;
    },
    onError: (err: any) => {
      toast.error("Save Failed", { description: err.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success(
        editingCert
          ? "Certificate updated successfully!"
          : "Certificate added successfully!"
      );
      closeModal();
    },
  });
};
