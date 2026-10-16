import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import CertificateCard from "@/components/CertificateCard";
import { useCertificates } from "@/hooks/useCertificates";
import { Loader2, Award, Sparkles } from "lucide-react";
import ErrorFallback from "@/components/ErrorFallback";
import type { Certificate } from "@/types/certificate";

type CertificateFilter = "all" | "free" | "paid";

const Certificates = () => {
  const { data: certificates = [], isLoading, error, refetch } = useCertificates();
  const [filter, setFilter] = useState<CertificateFilter>("all");

  const filteredCertificates = useMemo(() => {
    if (filter === "all") return certificates;
    return certificates.filter((cert) => {
      const type = cert.pricing_type || "free";
      return type === filter;
    });
  }, [certificates, filter]);

  const counts = useMemo(() => {
    return {
      all: certificates.length,
      free: certificates.filter((c) => (c.pricing_type || "free") === "free").length,
      paid: certificates.filter((c) => c.pricing_type === "paid").length,
    };
  }, [certificates]);

  return (
    <Layout>
      <Helmet>
        <title>Certificates - Uyarcha</title>
        <meta
          name="description"
          content="Explore verified professional certifications, achievements, and technical credentials on Uyarcha."
        />
      </Helmet>

      <div className="container py-12 md:py-16 animate-fade-in max-w-6xl min-h-screen">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-xs w-fit">
            <Sparkles size={13} />
            <span>Verified Credentials</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            Certifications & Achievements
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
            Professional certifications and recognized milestones in continuous learning, software engineering, and technical development.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 border-b border-border/60">
          {(
            [
              { id: "all", label: "All Certificates", count: counts.all },
              { id: "free", label: "Free", count: counts.free },
              { id: "paid", label: "Paid", count: counts.paid },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
                filter === tab.id
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  filter === tab.id
                    ? "bg-background/20 text-background"
                    : "bg-background text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <span className="text-sm font-semibold">Loading certificates...</span>
          </div>
        ) : error ? (
          <ErrorFallback message="Failed to load certificates." onRetry={refetch} />
        ) : filteredCertificates.length === 0 ? (
          <div className="py-20 px-6 text-center border border-dashed border-border rounded-2xl bg-card/50 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
              <Award size={24} />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {filter === "all"
                ? "No certificates found"
                : `No ${filter} certificates available`}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {filter === "all"
                ? "Check back soon for upcoming course completions and credentials."
                : `There are currently no certificates in the ${filter} tier. Switch back to "All" to browse other credentials.`}
            </p>
            {filter !== "all" && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-2 text-xs font-bold text-accent hover:underline"
              >
                View all certificates
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCertificates.map((cert: Certificate) => (
              <CertificateCard
                key={cert.id}
                title={cert.title}
                issuer={cert.issuer || "Unknown"}
                date={cert.issue_date || cert.created_at}
                verify_url={cert.verify_url}
                image={cert.image}
                description={cert.description}
                pricing_type={cert.pricing_type || "free"}
                price={cert.price}
                currency={cert.currency || "INR"}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;
