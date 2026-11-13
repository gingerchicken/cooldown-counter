/** Treat cross-tab messaging as optional browser coordination, never as authentication authority. */
export function openSessionChannel(name: string): BroadcastChannel | null {
  // name identifies a credential-free same-origin notification channel, not a user or tenant.
  try {
    // Some privacy policies expose the constructor but reject its use with SecurityError.
    return typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(name);
  } catch {
    // Cookie-session restoration and explicit login remain usable without optional messaging.
    return null;
  }
}

/** Notify other tabs without letting a failed optional message overturn an accepted server login/logout. */
export function notifySessionChange(
  channel: BroadcastChannel | null,
  message: string,
): void {
  // channel may be absent or closed; message contains a change signal without credentials or identity.
  try {
    // A server-confirmed authentication outcome remains authoritative if browser coordination fails.
    channel?.postMessage(message);
  } catch {
    // Other tabs still verify cookies on reload or when their protected requests are rejected.
  }
}
