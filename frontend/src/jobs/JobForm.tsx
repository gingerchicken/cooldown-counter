import { useState } from "react";
import type { FormEvent } from "react";
import { validateMessage } from "./validateMessage";

/** Connect the form to any async job creator without exposing transport details. */
export interface JobFormProps {
  /** Resolve only once Django has accepted the job; rejection is shown inline. */
  onSubmit: (message: string) => Promise<void>;
}

/** Collect a bounded message and report validation or submission failures. */
export function JobForm({ onSubmit }: JobFormProps) {
  // message holds the editable draft, error contains validation/server feedback,
  // and isSubmitting prevents duplicate writes while an accepted draft is pending.
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Validate before sending and preserve the draft when a request fails. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Prevent navigation because the typed package sends the protected request.
    event.preventDefault();
    // validationError contains the first rule violation, or null for an accepted draft.
    const validationError = validateMessage(message);
    if (validationError) {
      // Announce errors alongside the labelled input to keyboard and AT users.
      setError(validationError);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      // Clear only an accepted draft, allowing failed submissions to be retried.
      await onSubmit(message.trim());
      setMessage("");
    } catch (submissionError) {
      // Keep operational failures readable without assuming an Error subtype.
      setError(submissionError instanceof Error
        ? submissionError.message
        : "The job could not be created.");
    } finally {
      // Always release the submit button after success or failure.
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        // Keep navigation and error handling inside the async submit controller.
        void handleSubmit(event);
      }}
      noValidate
    >
      <label htmlFor="job-message">Message</label>
      <p id="message-help" className="muted">
        Celery will turn your message into uppercase. Up to 200 characters.
      </p>
      <textarea
        id="job-message"
        name="message"
        rows={3}
        value={message}
        onChange={(event) => {
          // Retain the editable draft while validation is shown.
          setMessage(event.target.value);
        }}
        aria-describedby={error ? "message-help message-error" : "message-help"}
        aria-invalid={Boolean(error)}
        disabled={isSubmitting}
      />
      {error && (
        <p id="message-error" role="alert" className="error">{error}</p>
      )}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating job..." : "Create job"}
      </button>
    </form>
  );
}
