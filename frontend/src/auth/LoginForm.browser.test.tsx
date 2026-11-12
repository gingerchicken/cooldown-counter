import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { ApiError } from "@template/api-client";
import type { LoginRequest } from "@template/api-client";
import { LoginForm } from "./LoginForm";

describe("login form in Chromium", () => {
  // Drive actual browser controls so keyboard submission and password behaviour are covered.
  it("submits with Enter, trims the username, and preserves password whitespace", async () => {
    // signIn records the credential boundary while simulating an accepted login.
    const signIn = vi.fn<(credentials: LoginRequest) => Promise<void>>().mockResolvedValue(undefined);
    // screen exposes labelled controls belonging only to this form.
    const screen = await render(<LoginForm onSubmit={signIn} />);
    await screen.getByRole("textbox", { name: "Username" }).fill("  alice  ");
    await screen.getByLabelText("Password").fill(" exact password ");
    await userEvent.keyboard("{Enter}");
    expect(signIn).toHaveBeenCalledWith({ username: "alice", password: " exact password " });
    await expect.element(screen.getByLabelText("Password")).toHaveValue("");
    await expect.element(screen.getByRole("textbox", { name: "Username" })).toHaveAttribute("autocomplete", "username");
    await expect.element(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
  });

  it("rejects missing credentials locally and focuses the first missing field", async () => {
    // signIn must not receive a request that the form can reject before touching the API.
    const signIn = vi.fn<(credentials: LoginRequest) => Promise<void>>().mockResolvedValue(undefined);
    // screen lets assertions use the same labels as assistive technology.
    const screen = await render(<LoginForm onSubmit={signIn} />);
    await screen.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Enter your username and password.");
    await expect.element(screen.getByRole("textbox", { name: "Username" })).toHaveFocus();
    await screen.getByRole("textbox", { name: "Username" }).fill("alice");
    await screen.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect.element(screen.getByLabelText("Password")).toHaveFocus();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("uses generic credential feedback, preserves username, and clears a rejected password", async () => {
    // Server details must not reveal whether a supplied account exists or is disabled.
    const signIn = vi.fn<(credentials: LoginRequest) => Promise<void>>().mockRejectedValue(new ApiError(400, { detail: "private backend detail" }));
    // screen owns the failed credential draft and its accessible error announcement.
    const screen = await render(<LoginForm onSubmit={signIn} />);
    await screen.getByRole("textbox", { name: "Username" }).fill("alice");
    await screen.getByLabelText("Password").fill("incorrect");
    await screen.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Invalid username or password.");
    await expect.element(screen.getByRole("textbox", { name: "Username" })).toHaveValue("alice");
    await expect.element(screen.getByLabelText("Password")).toHaveValue("");
    await expect.element(screen.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
  });

  it("shows an operational error without claiming the credentials were wrong", async () => {
    // A failed backend cannot validate credentials and should permit a deliberate retry.
    const signIn = vi.fn<(credentials: LoginRequest) => Promise<void>>().mockRejectedValue(new Error("network unavailable"));
    // screen exposes the retryable form after the request settles.
    const screen = await render(<LoginForm onSubmit={signIn} />);
    await screen.getByRole("textbox", { name: "Username" }).fill("alice");
    await screen.getByLabelText("Password").fill("some password");
    await screen.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Sign in is unavailable. Please try again.");
    await expect.element(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("disables credentials and submit while login confirmation is pending", async () => {
    // acceptLogin releases a held response only after duplicate protection is observed.
    let acceptLogin: (() => void) | undefined;
    // signIn remains pending so this case can inspect actual disabled browser controls.
    const signIn = vi.fn<(credentials: LoginRequest) => Promise<void>>(() => {
      // Capture this one attempt without introducing arbitrary timer delays.
      return new Promise((resolve) => { acceptLogin = resolve; });
    });
    // screen provides the controls belonging to the pending attempt.
    const screen = await render(<LoginForm onSubmit={signIn} />);
    await screen.getByRole("textbox", { name: "Username" }).fill("alice");
    await screen.getByLabelText("Password").fill("some password");
    await screen.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect.element(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled();
    await expect.element(screen.getByRole("textbox", { name: "Username" })).toBeDisabled();
    await expect.element(screen.getByLabelText("Password")).toBeDisabled();
    acceptLogin?.();
    await expect.element(screen.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
    expect(signIn).toHaveBeenCalledOnce();
  });
});
