import { afterEach, expect, it, vi } from "vitest";
import { notifySessionChange, openSessionChannel } from "./sessionChannel";

afterEach(() => {
  // Browser capability overrides must not affect later authentication or transport tests.
  vi.unstubAllGlobals();
});

it("permits authentication when optional channels are absent or denied", () => {
  // A missing constructor and a privacy-policy exception are distinct supported capability failures.
  vi.stubGlobal("BroadcastChannel", undefined);
  expect(openSessionChannel("test-session")).toBeNull();
  vi.stubGlobal(
    "BroadcastChannel",
    class {
      /** Simulate a present browser API that policy prevents the page from using. */
      constructor() {
        throw new DOMException("Disabled by policy", "SecurityError");
      }
    },
  );
  expect(openSessionChannel("test-session")).toBeNull();
});

it("opens an available channel and sends only the supplied notification", () => {
  // The real platform channel exercises construction and shutdown without replacing session authentication.
  const channel = openSessionChannel("cooldown-unit-session");
  expect(channel).not.toBeNull();
  channel?.close();
  // send captures the credential-free signal independently of native inter-process delivery timing.
  const send = vi.fn(),
    sender = { postMessage: send } as unknown as BroadcastChannel;
  notifySessionChange(sender, "session-changed");
  expect(send).toHaveBeenCalledExactlyOnceWith("session-changed");
});

it("does not turn successful authentication into a failure when notification is unavailable", () => {
  // A closed or policy-rejected sender must not throw back into the login/logout controller.
  const sender = {
    postMessage() {
      throw new DOMException("Closed", "InvalidStateError");
    },
  } as unknown as BroadcastChannel;
  expect(() => notifySessionChange(sender, "session-changed")).not.toThrow();
  expect(() => notifySessionChange(null, "session-changed")).not.toThrow();
});
