import { useCallback, useEffect, useRef, useState } from "react";
import { createApiClient } from "@template/api-client";
import type { AuthenticatedUser, LoginRequest } from "@template/api-client";
import { LoginForm } from "./auth/LoginForm";
import { notifySessionChange, openSessionChannel } from "./auth/sessionChannel";
import { TrackerWorkspace } from "./tracker/TrackerWorkspace";

// One client shares HttpOnly session cookies and CSRF rotation across every screen.
const apiClient = createApiClient();

// AUTH_SESSION_CHANNEL reaches same-origin tabs; SESSION_CHANGED_MESSAGE carries no account data.
const AUTH_SESSION_CHANNEL = "template-auth-session";
const SESSION_CHANGED_MESSAGE = "session-changed";

/** Session uncertainty is separate from an accepted anonymous or authenticated response. */
type SessionState =
  | { status: "checking" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: AuthenticatedUser }
  | { status: "error" };

/** Gate the application with Django session authentication rather than browser-only visibility. */
export function App() {
  // session controls protected mounting; sessionAttempt permits deliberate retry after an outage.
  // isLoggingOut and logoutError preserve signed-in content until the server confirms logout.
  const [session, setSession] = useState<SessionState>({ status: "checking" });
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  // sessionChannel owns this tab's sender/listener, so its own broadcasts are never received here.
  const sessionChannel = useRef<BroadcastChannel | null>(null);
  // sessionRevision invalidates older reads/writes; sessionCheckAbort cancels an obsolete identity read.
  const sessionRevision = useRef(0);
  const sessionCheckAbort = useRef<AbortController | null>(null);

  /** Hide old account data immediately when another tab changes the shared browser cookies. */
  const requestSessionCheck = useCallback(() => {
    // Increment before state updates so an already-resolving request cannot restore stale identity.
    sessionRevision.current += 1;
    sessionCheckAbort.current?.abort();
    apiClient.resetCsrfToken();
    setSession({ status: "checking" });
    setLogoutError(null);
    setIsLoggingOut(false);
    setSessionAttempt((currentAttempt) => {
      // Every explicit invalidation starts one new authoritative cookie-session read.
      return currentAttempt + 1;
    });
  }, []);

  useEffect(() => {
    // channel belongs to this mounted tab; messages contain no tokens, usernames, or passwords.
    const channel = openSessionChannel(AUTH_SESSION_CHANNEL);
    sessionChannel.current = channel;

    /** Treat a sibling tab's login/logout as an invalidated local identity, never as a supplied user. */
    function receiveSessionChange(event: MessageEvent<unknown>) {
      // Unknown messages are ignored rather than trusting account data from another script.
      if (event.data === SESSION_CHANGED_MESSAGE) {
        requestSessionCheck();
      }
    }

    channel?.addEventListener("message", receiveSessionChange);
    return () => {
      // Strict Mode and unmount must release the listener and its underlying browser channel.
      channel?.removeEventListener("message", receiveSessionChange);
      channel?.close();
      if (sessionChannel.current === channel) {
        // A stale cleanup must not discard a newer channel opened for the same component.
        sessionChannel.current = null;
      }
    };
  }, [requestSessionCheck]);

  useEffect(() => {
    // Abort stale session checks on unmount or after the visitor explicitly retries.
    const abortController = new AbortController();
    // checkRevision identifies the cookie state this read was allowed to establish.
    const checkRevision = sessionRevision.current;
    sessionCheckAbort.current = abortController;

    /** Restore the cookie identity while keeping server outages distinct from a signed-out user. */
    async function checkSession() {
      try {
        // checkedSession contains a public identity or null, never the cookie credential itself.
        const checkedSession = await apiClient.getSession({
          signal: abortController.signal,
        });
        if (
          !abortController.signal.aborted &&
          checkRevision === sessionRevision.current
        ) {
          // Only a completed authoritative read may unlock protected account content.
          setSession(
            checkedSession.user === null
              ? { status: "anonymous" }
              : { status: "authenticated", user: checkedSession.user },
          );
        }
      } catch {
        // A connectivity error cannot safely be interpreted as an anonymous response.
        if (
          !abortController.signal.aborted &&
          checkRevision === sessionRevision.current
        ) {
          setSession({ status: "error" });
        }
      }
    }

    void checkSession();
    return () => {
      // React Strict Mode and retry cleanup must not apply obsolete account responses.
      abortController.abort();
      if (sessionCheckAbort.current === abortController) {
        // Another effect may already own the next check, so clear only this read's reference.
        sessionCheckAbort.current = null;
      }
    };
  }, [sessionAttempt]);

  /** Remove all protected screen state when the server rejects an expired cookie session. */
  const handleSessionExpired = useCallback(() => {
    // The tracker unmounts here, discarding every protected fleet snapshot and unfinished draft.
    sessionRevision.current += 1;
    sessionCheckAbort.current?.abort();
    apiClient.resetCsrfToken();
    setSession({ status: "anonymous" });
    setLogoutError(null);
  }, []);

  /** Accept the identity only after the package's protected login succeeds. */
  async function signIn(credentials: LoginRequest) {
    // loginRevision prevents this attempt from overwriting a newer cross-tab cookie transition.
    const loginRevision = sessionRevision.current;
    // authenticatedUser is the server-confirmed account identity, not browser input.
    const authenticatedUser = await apiClient.login(credentials);
    notifySessionChange(sessionChannel.current, SESSION_CHANGED_MESSAGE);
    if (loginRevision !== sessionRevision.current) {
      // The login changed cookies, but only a fresh read can resolve concurrent tab transitions.
      requestSessionCheck();
      return;
    }
    sessionRevision.current += 1;
    setSession({ status: "authenticated", user: authenticatedUser });
    setLogoutError(null);
  }

  /** Keep account content visible on a failed logout instead of claiming the session ended. */
  async function signOut() {
    // logoutRevision ties feedback and completion to the account that started the request.
    const logoutRevision = sessionRevision.current;
    // Disable repeated logout requests while one server confirmation is pending.
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      // The package invalidates its cached token only when logout was accepted.
      await apiClient.logout();
      notifySessionChange(sessionChannel.current, SESSION_CHANGED_MESSAGE);
      if (logoutRevision !== sessionRevision.current) {
        // A sibling tab may have already established another identity using the shared cookies.
        requestSessionCheck();
        return;
      }
      setIsLoggingOut(false);
      sessionRevision.current += 1;
      setSession({ status: "anonymous" });
    } catch {
      // A failed or ambiguous network request needs a deliberate retry or later session check.
      if (logoutRevision === sessionRevision.current) {
        // Do not attach a previous account's failed action to a newer signed-in identity.
        setLogoutError("Sign out could not be confirmed. Please try again.");
      }
    } finally {
      // A failed logout must release its control without retaining any password or cookie value.
      if (logoutRevision === sessionRevision.current) {
        // A newer identity transition owns its own controls and must not be changed by this request.
        setIsLoggingOut(false);
      }
    }
  }

  // Preserve the existing cookie-session gate while the tracker owns fleet-scoped application state.
  if (session.status === "authenticated") {
    return (
      <TrackerWorkspace
        key={session.user.id}
        client={apiClient}
        user={session.user}
        onSessionExpired={handleSessionExpired}
        onSignOut={signOut}
        isLoggingOut={isLoggingOut}
        logoutError={logoutError}
      />
    );
  }

  return (
    <main className="auth-shell">
      <header className="page-header">
        <span className="brand-mark" aria-hidden="true">
          CC
        </span>
        <span className="eyebrow">PRIVATE FLEET TRACKING</span>
        <h1>Cooldown Counter</h1>
        <p>Cooldown records are restricted to fleet operators.</p>
      </header>
      {session.status === "checking" && (
        <p role="status">Checking your session...</p>
      )}
      {session.status === "error" && (
        <section className="panel" aria-label="Session unavailable">
          <p role="alert" className="error">
            Your sign-in status could not be checked. Please try again.
          </p>
          <button
            type="button"
            onClick={() => {
              // Explicit retry starts a fresh check without exposing protected content meanwhile.
              requestSessionCheck();
            }}
          >
            Try again
          </button>
        </section>
      )}
      {session.status === "anonymous" && (
        <section className="panel login-panel" aria-label="Account sign in">
          <h2>Sign in</h2>
          <LoginForm onSubmit={signIn} />
        </section>
      )}
      <footer>
        Use your provisioned operator account. There are no default login
        credentials.
      </footer>
    </main>
  );
}
