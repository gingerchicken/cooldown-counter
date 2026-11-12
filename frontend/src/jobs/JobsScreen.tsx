import { useEffect, useRef, useState } from "react";
import { ApiError } from "@template/api-client";
import type { ApiClient, Job } from "@template/api-client";
import { JobForm } from "./JobForm";
import { JobList } from "./JobList";

/** Keep account state in App while this mounted screen owns only protected job data. */
export interface JobsScreenProps {
  /** The shared client uses the same cookie and rotated token for auth and job requests. */
  client: Pick<ApiClient, "listJobs" | "createJob" | "getSession">;
  /** Remove protected content when the server no longer accepts the cookie session. */
  onSessionExpired: () => void;
}

/** Poll account-owned jobs and discard their state when logout unmounts the screen. */
export function JobsScreen({ client, onSessionExpired }: JobsScreenProps) {
  // jobs retains durable responses, isLoading marks the first read, and loadError preserves failures.
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // isMounted prevents a delayed previous-account write from changing the new account gate.
  const isMounted = useRef(false);

  useEffect(() => {
    // The lifetime marker also covers write responses, which must not be automatically replayed.
    isMounted.current = true;
    // abortController stops reads on logout; nextPoll bounds polling to one settled request.
    const abortController = new AbortController();
    let nextPoll: ReturnType<typeof setTimeout> | undefined;

    /** Reconcile durable worker state without keeping requests alive after logout. */
    async function refreshJobs() {
      try {
        // The API client owns session cookies and bootstrap before the protected read.
        const loadedJobs = await client.listJobs({ signal: abortController.signal });
        if (!abortController.signal.aborted) {
          // Only this mounted account screen may apply the completed snapshot.
          setJobs(loadedJobs);
          setLoadError(null);
        }
      } catch (requestError) {
        // Cancellation during logout is expected and must not create a visible failure.
        if (!abortController.signal.aborted) {
          if (requestError instanceof ApiError && [401, 403].includes(requestError.status)) {
            // Safe reads have no CSRF requirement, so rejected job reads mean auth has expired.
            onSessionExpired();
            return;
          }
          setLoadError("Jobs could not be loaded. We will try again shortly.");
        }
      } finally {
        // Schedule after settlement so slow requests cannot create overlapping polling loops.
        if (!abortController.signal.aborted) {
          setIsLoading(false);
          nextPoll = setTimeout(() => {
            // Observe worker progress without navigating or keeping a second cache of results.
            void refreshJobs();
          }, 1_000);
        }
      }
    }

    void refreshJobs();
    return () => {
      // Remove both the active read and its successor when the account boundary changes.
      isMounted.current = false;
      abortController.abort();
      clearTimeout(nextPoll);
    };
  }, [client, onSessionExpired]);

  /** Publish once and let the server confirm whether a forbidden mutation means session expiry. */
  async function submitJob(message: string) {
    try {
      // createdJob is the accepted row; polling may already have observed its ID.
      const createdJob = await client.createJob({ message });
      if (!isMounted.current) {
        // Logout may have unmounted this account while the already-sent write completed.
        return;
      }
      setJobs((currentJobs) => {
        // De-duplicate this response against a concurrent poll without losing other account work.
        return [createdJob, ...currentJobs.filter((existingJob) => {
          // The database identity is stable across create and subsequent list responses.
          return existingJob.id !== createdJob.id;
        })];
      });
    } catch (creationError) {
      // A mutation can fail CSRF while the user is still signed in; confirm before removing UI.
      if (creationError instanceof ApiError && [401, 403].includes(creationError.status)) {
        try {
          // currentSession distinguishes expired authentication from a recoverable CSRF rejection.
          const currentSession = await client.getSession();
          if (currentSession.user === null && isMounted.current) {
            // Removing this component also clears any stale account-owned rows from memory.
            onSessionExpired();
          }
        } catch {
          // Keep the original write error when a failed network check cannot prove expiry.
        }
      }
      throw creationError;
    }
  }

  return (
    <>
      <section className="panel" aria-labelledby="create-heading">
        <h2 id="create-heading">Create a job</h2>
        <JobForm onSubmit={submitJob} />
      </section>
      <section className="panel" aria-labelledby="jobs-heading">
        <h2 id="jobs-heading">Your jobs</h2>
        <p className="muted">Jobs belong to your account and stay here when you sign in again.</p>
        {isLoading && <p role="status">Loading jobs...</p>}
        {loadError && <p role="alert" className="error">{loadError}</p>}
        {/* A failed initial read must not claim the account has no saved work. */}
        {!isLoading && (!loadError || jobs.length > 0) && <JobList jobs={jobs} />}
      </section>
    </>
  );
}
