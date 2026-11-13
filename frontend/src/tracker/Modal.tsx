import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Present children in a native dialog named by title, with focus containment and background inertness.
 * onDismiss delegates closing to the owner; busy blocks user dismissal while an operation is unresolved.
 */
export function Modal({
  title,
  onDismiss,
  children,
  busy = false,
}: {
  title: string;
  onDismiss: () => void;
  children: ReactNode;
  busy?: boolean;
}) {
  // dialog retains the native focus-trapping element; titleId uniquely links its accessible heading.
  const dialog = useRef<HTMLDialogElement>(null),
    titleId = useId();
  useEffect(() => {
    // launcher retains the initiating control for focus return; element captures this effect's dialog.
    const launcher = document.activeElement,
      element = dialog.current;
    element?.showModal();
    // React autoFocus may run while the native dialog is closed, before its controls can receive focus.
    // initialField honors explicit focus intent, then selects the first enabled editable control.
    const initialField =
      element?.querySelector<HTMLElement>("[autofocus]") ??
      element?.querySelector<HTMLElement>(
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
      );
    initialField?.focus();
    return () => {
      // Unmount on cancel, logout or fleet switch clears both modal state and background inertness.
      element?.close();
      // A route or tenant switch may remove the launcher; restore focus only to a live HTML element.
      if (launcher instanceof HTMLElement && launcher.isConnected)
        launcher.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className="modal"
      onCancel={(event) => {
        // event is the native Escape request; always prevent browser-only closing from desyncing React.
        event.preventDefault();
        // An in-flight mutation must settle before Escape can imply the action was cancelled.
        if (!busy) onDismiss();
      }}
    >
      <header className="modal-heading">
        <div>
          <p className="eyebrow">COOLDOWN COUNTER</p>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label={`Close ${title}`}
          disabled={busy}
          onClick={onDismiss}
        >
          ×
        </button>
      </header>
      {children}
    </dialog>
  );
}
