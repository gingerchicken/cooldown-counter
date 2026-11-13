import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@template/api-client";
import { describeError } from "./api";

/** One accepted snapshot belongs to exactly one stable loader identity. */
interface ResourceSnapshot<T> {
  /** Loader identity prevents prior account/range data being associated with new inputs. */
  source: (signal: AbortSignal) => Promise<T>;
  /** Null means no accepted data, distinct from a valid empty list. */
  data: T | null;
  /** Pending and failure are explicit states rather than manufactured empty results. */
  pending: boolean;
  /** Human-readable feedback is absent after a successful read or while an explicit retry begins. */
  error: string | null;
}

/** Own a cancellable read with serialized polling and explicit access-revocation handling. */
export function useResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  refreshEveryMs?: number,
) {
  // Snapshot ownership is checked during render, before an effect can fetch a new resource.
  const [snapshot, setSnapshot] = useState<ResourceSnapshot<T>>(() => ({
    source: load,
    data: null,
    pending: true,
    error: null,
  }));
  // Attempts represent deliberate read retries; they never replay an ambiguous mutation.
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    // This generation loses permission to publish immediately on loader change, retry or unmount.
    const controller = new AbortController();
    // A successor is scheduled after settlement, so slow requests cannot create overlapping polls.
    let timer: ReturnType<typeof setTimeout> | undefined;
    /** Publish only a response still belonging to the current live resource generation. */
    async function refresh() {
      try {
        // Every loader uses the shared authoritative cookie-session transport.
        const accepted = await load(controller.signal);
        if (!controller.signal.aborted) {
          // An accepted empty array is valid data, unlike an absent or denied snapshot.
          setSnapshot({
            source: load,
            data: accepted,
            pending: false,
            error: null,
          });
        }
      } catch (failure) {
        // Ignore rejected reads from generations superseded by navigation, retry or unmount.
        if (!controller.signal.aborted) {
          // Definitive denial or removal revokes old records; a transient outage may retain them.
          const revoked =
            failure instanceof ApiError &&
            [401, 403, 404].includes(failure.status);
          setSnapshot((current) => {
            // An outage can preserve only this exact resource's earlier accepted snapshot.
            return {
              source: load,
              data: !revoked && current.source === load ? current.data : null,
              pending: false,
              error: describeError(failure),
            };
          });
        }
      } finally {
        // Settled polls schedule one successor; cancelled generations can never restart themselves.
        if (!controller.signal.aborted && refreshEveryMs) {
          // A live refresh interval schedules one read after settlement rather than overlapping slow requests.
          timer = setTimeout(() => {
            // The next poll remains owned by this cancellable loader generation.
            void refresh();
          }, refreshEveryMs);
        }
      }
    }
    void refresh();
    return () => {
      // Aborting removes publication rights even if a non-cooperative loader later settles.
      controller.abort();
      clearTimeout(timer);
    };
  }, [load, attempt, refreshEveryMs]);
  /** Enter a visible pending state while preserving only the same resource's accepted data. */
  const retry = useCallback(() => {
    // Explicit retry is an event transition, avoiding synchronous effect-driven state churn.
    setSnapshot((current) => {
      // Pending feedback can accompany accepted data only when it still belongs to this exact loader.
      return {
        source: load,
        data: current.source === load ? current.data : null,
        pending: true,
        error: null,
      };
    });
    setAttempt((current) => {
      // Changing the attempt cancels the former generation and starts one deliberate successor.
      return current + 1;
    });
  }, [load]);
  // A changed range/fleet/account is pending immediately, with no old-resource data attached.
  const ownsSnapshot = snapshot.source === load;
  return {
    data: ownsSnapshot ? snapshot.data : null,
    pending: ownsSnapshot ? snapshot.pending : true,
    error: ownsSnapshot ? snapshot.error : null,
    retry,
  };
}
