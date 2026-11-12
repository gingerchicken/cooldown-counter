import type { Job } from "@template/api-client";

/** Render the durable state of one asynchronous job without a client-side guess. */
export function JobCard({ job }: { job: Job }) {
  // The API status is authoritative; a pending job may outlive this page visit.
  return (
    <li className="job-card">
      <div className="job-heading">
        <h3>{job.message}</h3>
        <span className={`status status-${job.status}`}>{job.status}</span>
      </div>
      {job.status === "pending" && (
        <p className="muted">Waiting for the worker...</p>
      )}
      {job.status === "succeeded" && (
        <p className="job-result">{job.result}</p>
      )}
      {job.status === "failed" && (
        <p className="error">This job failed. Create a new job to try again.</p>
      )}
    </li>
  );
}
