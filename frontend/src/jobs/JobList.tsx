import type { Job } from "@template/api-client";
import { JobCard } from "./JobCard";

/** Show persisted jobs owned by the signed-in account with an explicit empty state. */
export function JobList({ jobs }: { jobs: Job[] }) {
  // An empty successful response differs from the loading and error states.
  if (jobs.length === 0) {
    return <p className="empty-state">No jobs yet. Create your first one above.</p>;
  }
  return (
    <ul className="job-list" aria-label="Your jobs">
      {jobs.map((job) => {
        // Stable database ids preserve each card across polling responses.
        return <JobCard key={job.id} job={job} />;
      })}
    </ul>
  );
}
