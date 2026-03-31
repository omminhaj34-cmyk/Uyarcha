import { useQuery } from "@tanstack/react-query";
import { getCertificates } from "@/queries/getCertificates";
import type { Certificate } from "@/types/certificate";

export const useCertificates = () => {
  return useQuery<Certificate[]>({
    queryKey: ['certificates'],
    queryFn: getCertificates,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
};
