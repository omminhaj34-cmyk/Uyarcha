import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight, Sparkles, MapPin, Clock } from "lucide-react";
import Layout from "@/components/Layout";

const sampleOpportunities = [
  {
    title: "Full Stack Software Engineer",
    type: "Full-time",
    location: "Remote / Hybrid",
    department: "Engineering",
    description: "Build robust web applications and scalable APIs with modern TypeScript, React, and cloud backends.",
  },
  {
    title: "Frontend Developer (React & UI/UX)",
    type: "Full-time",
    location: "Remote",
    department: "Product Design",
    description: "Design pixel-perfect, responsive user interfaces and maintain accessible component systems.",
  },
  {
    title: "AI & Machine Learning Specialist",
    type: "Full-time",
    location: "Remote",
    department: "Data Science",
    description: "Develop generative AI workflows, evaluate language models, and integrate intelligent automation.",
  },
];

const Jobs = () => {
  return (
    <Layout>
      <Helmet>
        <title>Jobs - Uyarcha</title>
        <meta
          name="description"
          content="Explore tech job openings, engineering roles, and career opportunities at Uyarcha."
        />
      </Helmet>

      <div className="container py-12 md:py-16 animate-fade-in max-w-5xl min-h-[70vh]">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Careers & Opportunities</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Explore Tech Jobs
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Discover verified tech positions, engineering roles, and growth opportunities tailored for builders and developers.
          </p>
        </div>

        {/* Featured Listings */}
        <div className="space-y-4 mb-12">
          <h2 className="text-xl font-bold text-foreground">Open Positions</h2>
          <div className="grid gap-4">
            {sampleOpportunities.map((job, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xl">{job.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity w-full sm:w-auto shrink-0"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

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
