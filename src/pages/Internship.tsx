import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, Code, Cpu, Database, CheckCircle2 } from "lucide-react";
import Layout from "@/components/Layout";

const tracks = [
  {
    icon: Code,
    title: "Frontend & Full Stack Internship",
    duration: "3 - 6 Months",
    mode: "Remote",
    highlights: ["React, TypeScript & Tailwind", "API Integration & Next-gen tooling", "Real-world project portfolio"],
  },
  {
    icon: Cpu,
    title: "AI & Machine Learning Internship",
    duration: "3 - 6 Months",
    mode: "Remote",
    highlights: ["Python & PyTorch fundamentals", "LLM integrations & prompt workflows", "Applied data engineering"],
  },
  {
    icon: Database,
    title: "Backend & Cloud Systems Internship",
    duration: "3 - 6 Months",
    mode: "Remote",
    highlights: ["PostgreSQL & Supabase schemas", "Serverless edge functions", "Security & authentication"],
  },
];

const Internship = () => {
  return (
    <Layout>
      <Helmet>
        <title>Internship - Uyarcha</title>
        <meta
          name="description"
          content="Accelerate your engineering journey with hands-on technical internships and mentorship programs at Uyarcha."
        />
      </Helmet>

      <div className="container py-12 md:py-16 animate-fade-in max-w-5xl min-h-[70vh]">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent w-fit">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student & Early Career Programs</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Internship Opportunities
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Gain practical, production-level development experience through guided tech tracks, hands-on mentorship, and portfolio-ready projects.
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tracks.map((track, idx) => {
            const Icon = track.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-accent/50 hover:shadow-sm transition-all"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">{track.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{track.duration}</span>
                      <span>•</span>
                      <span>{track.mode}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 pt-2">
                    {track.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-6">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-secondary hover:text-accent transition-colors w-full"
                  >
                    Inquire Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inquiry Callout */}
        <div className="p-8 rounded-2xl bg-secondary/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-foreground font-semibold text-base">Looking for custom training or cohort placements?</h3>
            <p className="text-sm text-muted-foreground">
              We collaborate with colleges, bootcamps, and early-career developers to offer targeted learning roadmaps and practical workshops.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm shrink-0"
          >
            Apply for Cohort
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Internship;
