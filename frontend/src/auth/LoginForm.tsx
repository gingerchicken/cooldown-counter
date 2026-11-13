import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "@template/api-client";
import type { LoginRequest } from "@template/api-client";

/** Let the application own the authenticated identity while this form owns only its draft. */
export interface LoginFormProps {
  /** Resolve after authentication is confirmed; rejection keeps the visitor on this form. */
  onSubmit: (credentials: LoginRequest) => Promise<void>;
}

/** Collect username/password without persisting credentials outside component memory. */
export function LoginForm({ onSubmit }: LoginFormProps) {
  // username is a recoverable draft; password exists only until an attempt settles.
  // error announces validation or server feedback; isSubmitting prevents duplicate logins.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // usernameInput and passwordInput focus the first missing field without custom tab handling.
  const usernameInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  /** Validate locally, preserve password whitespace, and discard the secret after each attempt. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // The package sends the protected request; a form submission must not navigate.
    event.preventDefault();
    if (!username.trim() || !password) {
      // Empty fields never reach the server, and keyboard focus identifies the missing input.
      setError(!username.trim() && !password
        ? "Enter a username and password."
        : (!username.trim() ? "Enter a username." : "Enter a password."));
      if (!username.trim()) {
        // Username is the first field in the standard sign-in sequence.
        usernameInput.current?.focus();
      } else {
        // A supplied username should remain intact while the missing secret is entered.
        passwordInput.current?.focus();
      }
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      // Usernames can be trimmed; password whitespace remains part of the credential.
      await onSubmit({ username: username.trim(), password });
    } catch (authenticationError) {
      // Generic credential feedback avoids disclosing whether a username exists or is inactive.
      setError(authenticationError instanceof ApiError && authenticationError.status === 400
        ? "Invalid username or password."
        : "Sign in is unavailable. Please try again.");
    } finally {
      // Forget submitted secrets after success or failure; the username stays useful for retrying.
      setPassword("");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      aria-label="Sign in"
      onSubmit={(event) => {
        // Keep async error handling in the submit controller rather than the DOM callback.
        void handleSubmit(event);
      }}
      noValidate
    >
      <label htmlFor="login-username">Username</label>
      <input
        ref={usernameInput}
        id="login-username"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        value={username}
        onChange={(event) => {
          // Retain the account name during a failed attempt without storing it globally.
          setUsername(event.target.value);
          // A changed input invalidates feedback about the previous credential draft.
          setError(null);
        }}
        aria-describedby={error ? "login-error" : undefined}
        aria-invalid={Boolean(error)}
        disabled={isSubmitting}
        required
      />
      <label htmlFor="login-password" className="field-label">Password</label>
      <input
        ref={passwordInput}
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => {
          // Keep the secret only in this form until the next attempt settles.
          setPassword(event.target.value);
          // Do not leave a missing-input or rejected-credential message attached to new input.
          setError(null);
        }}
        aria-describedby={error ? "login-error" : undefined}
        aria-invalid={Boolean(error)}
        disabled={isSubmitting}
        required
      />
      {error && <p id="login-error" role="alert" className="error">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
