import { ArrowRight, MapPin, Clock, Building2, Globe } from "lucide-react";
import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const isExternalUrl = Boolean(
    job.application_url &&
      (job.application_url.startsWith("http://") ||
        job.application_url.startsWith("https://") ||
        job.application_url.startsWith("mailto:"))
  );

  return (
    <div className="p-6 sm:p-7 rounded-xl border border-border bg-card hover:border-accent/40 hover:shadow-sm transition-all flex flex-col justify-between gap-5 group">
      <div className="space-y-3">
        {/* Title + Role Badge */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
            {job.title}
          </h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground shrink-0">
            {job.role}
          </span>
        </div>

        {/* Job Description */}
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">
          {job.description}
        </p>

        {/* Company Name */}
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
          <Building2 className="w-4 h-4 text-accent shrink-0" />
          <span>{job.company_name}</span>
        </div>
      </div>

      {/* Meta row + Apply Button */}
      <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Work Arrangement, Employment Type, Location */}
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground font-medium">
          {/* Work Arrangement */}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span>{job.work_arrangement}</span>
          </span>

          <span className="text-border">•</span>

          {/* Employment Type */}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{job.employment_type}</span>
          </span>

          {/* Location if available */}
          {job.location && (
            <>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{job.location}</span>
              </span>
            </>
          )}
        </div>

        {/* Apply Now Button */}
        <div>
          {isExternalUrl ? (
            <a
              href={job.application_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity w-full sm:w-auto shadow-xs shrink-0"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity w-full sm:w-auto shadow-xs shrink-0"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
