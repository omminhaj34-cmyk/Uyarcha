import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import CertificateCard from "@/components/CertificateCard";
import { useCertificates } from "@/hooks/useCertificates";
import { Loader2 } from "lucide-react";
import ErrorFallback from "@/components/ErrorFallback";
import type { Certificate } from "@/types/certificate";

const Certificates = () => {
  const { data: certificates = [], isLoading, error, refetch } = useCertificates();

  return (
    <Layout>
      <Helmet>
        <title>Certificates - Uyarcha</title>
        <meta name="description" content="Professional certifications and achievements." />
      </Helmet>
      
      <div className="container py-16 animate-fade-in max-w-5xl min-h-screen">
        <div className="flex flex-col gap-4 mb-16">
            <h1 className="font-display text-5xl font-black tracking-tight text-foreground">
                Certificates
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Professional certifications and milestones in continuous learning and skill development.
            </p>
        </div>

        {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        ) : error ? (
            <ErrorFallback message="Failed to load certificates." onRetry={refetch} />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((cert: Certificate) => (
                    <CertificateCard 
                        key={cert.id}
                        title={cert.title}
                        issuer={cert.issuer || "Unknown"}
                        date={new Date(cert.issue_date || cert.created_at).toLocaleDateString()}
                        verify_url={cert.verify_url}
                        image={cert.image}
                    />
                ))}
            </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;
