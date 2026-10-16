import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Briefcase, Sparkles, Filter, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import JobCard from "@/components/JobCard";
import { usePublicJobs } from "@/hooks/useJobs";
import type { Job } from "@/types/job";

// Fallback seed opportunities if DB table is completely fresh / empty
const fallbackSeedJobs: Job[] = [
  {
    id: "seed-1",
    title: "Full Stack Software Engineer",
    company_name: "Uyarcha Engineering",
    role: "Engineering",
    description:
      "Build robust web applications and scalable APIs with modern TypeScript, React, and cloud backends.",
    work_arrangement: "Hybrid",
    employment_type: "Full-time",
    location: "Kochi, Kerala, India",
    status: "published",
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "Frontend Developer (React & UI/UX)",
    company_name: "Uyarcha Product Design",
    role: "Product Design",
    description:
      "Design pixel-perfect, responsive user interfaces and maintain accessible component systems.",
    work_arrangement: "Remote",
    employment_type: "Full-time",
    location: "Remote",
    status: "published",
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "AI & Machine Learning Specialist",
    company_name: "Uyarcha AI Labs",
    role: "Data Science",
    description:
      "Develop generative AI workflows, evaluate language models, and integrate intelligent automation.",
    work_arrangement: "Remote",
    employment_type: "Full-time",
    location: "Remote",
    status: "published",
    created_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
];

const Jobs = () => {
  const { data: dbJobs = [], isLoading, isError } = usePublicJobs();
  const [filterType, setFilterType] = useState<string>("All");

  // Display DB jobs if available; if DB query returns 0 jobs, show fallback seed jobs so page is never broken
  const allJobs = useMemo(() => {
    return dbJobs.length > 0 ? dbJobs : fallbackSeedJobs;
  }, [dbJobs]);

  const filteredJobs = useMemo(() => {
    if (filterType === "All") return allJobs;
    return allJobs.filter(
      (job) =>
        job.work_arrangement.toLowerCase() === filterType.toLowerCase() ||
        job.employment_type.toLowerCase() === filterType.toLowerCase()
    );
  }, [allJobs, filterType]);

  return (
    <Layout>
      <Helmet>
        <title>Jobs & Careers - Uyarcha</title>
        <meta
          name="description"
          content="Explore tech job openings, engineering roles, and career opportunities at Uyarcha."
        />
      </Helmet>

      <div className="container py-12 md:py-16 animate-fade-in max-w-5xl min-h-[70vh]">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Careers & Opportunities</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Open Positions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Discover verified tech positions, engineering roles, and growth opportunities tailored for builders and developers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 mb-8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          {["All", "Remote", "Hybrid", "On-site", "Full-time", "Part-time", "Internship"].map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterType === tab
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="space-y-4 mb-12">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-6 rounded-xl border border-border bg-card animate-pulse space-y-4"
              >
                <div className="h-6 w-1/3 bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive mb-12 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">
              Unable to load current job opportunities. Please try again later.
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-border bg-card mb-12 space-y-3">
            <Briefcase className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-lg text-foreground">No openings matching this filter</h3>
            <p className="text-sm text-muted-foreground">
              Try selecting "All" or check back later for new listings.
            </p>
            <button
              onClick={() => setFilterType("All")}
              className="text-xs font-bold text-accent hover:underline pt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Hiring Callout */}
        <div className="p-8 rounded-2xl bg-secondary/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Briefcase className="w-5 h-5 text-accent" />
              <span>Are you hiring top tech talent?</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Partner with Uyarcha to publish verified career openings, reach skilled engineers, and connect with motivated technology professionals.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-lg border border-border bg-card text-foreground font-semibold hover:bg-secondary hover:text-accent transition-colors text-sm shrink-0"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
