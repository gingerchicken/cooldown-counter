import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { JobForm } from "./JobForm";

describe("job form in Chromium", () => {
  // Real browser events cover accepted, invalid, failed and pending form states.
  it("submits a trimmed message through labelled controls and clears an accepted draft", async () => {
    // Drive actual browser inputs rather than synthesizing React events.
    // submitJob represents the asynchronous package call supplied by the parent screen.
    const submitJob = vi.fn<(message: string) => Promise<void>>().mockResolvedValue(undefined);
    // screen exposes accessible locators scoped to this mounted form.
    const screen = await render(<JobForm onSubmit={submitJob} />);
    await screen.getByRole("textbox", { name: "Message" }).fill("  hello worker  ");
    await screen.getByRole("button", { name: "Create job" }).click();
    expect(submitJob).toHaveBeenCalledWith("hello worker");
    await expect.element(screen.getByRole("textbox", { name: "Message" })).toHaveValue("");
  });

  it("announces blank validation and keeps the request local", async () => {
    // A whitespace-only draft must not send a protected but invalid write.
    // submitJob represents the asynchronous package call supplied by the parent screen.
    const submitJob = vi.fn<(message: string) => Promise<void>>().mockResolvedValue(undefined);
    // screen exposes accessible locators scoped to this mounted form.
    const screen = await render(<JobForm onSubmit={submitJob} />);
    await screen.getByRole("textbox", { name: "Message" }).fill("   ");
    await screen.getByRole("button", { name: "Create job" }).click();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Enter a message.");
    await expect.element(screen.getByRole("textbox", { name: "Message" })).toHaveAttribute("aria-invalid", "true");
    expect(submitJob).not.toHaveBeenCalled();
  });

  it("preserves the draft and releases the button after a server failure", async () => {
    // Failed work stays editable so the user chooses whether to retry it.
    // submitJob represents the asynchronous package call supplied by the parent screen.
    const submitJob = vi.fn<(message: string) => Promise<void>>().mockRejectedValue(new Error("The API is unavailable."));
    // screen exposes accessible locators scoped to this mounted form.
    const screen = await render(<JobForm onSubmit={submitJob} />);
    await screen.getByRole("textbox", { name: "Message" }).fill("keep this message");
    await screen.getByRole("button", { name: "Create job" }).click();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("The API is unavailable.");
    await expect.element(screen.getByRole("textbox", { name: "Message" })).toHaveValue("keep this message");
    await expect.element(screen.getByRole("button", { name: "Create job" })).toBeEnabled();
  });

  it("disables the form while a submission is pending", async () => {
    // Hold the server response to observe the real in-flight browser state.
    // acceptSubmission lets this case release the held request after observing pending state.
    let acceptSubmission: (() => void) | undefined;
    // submitJob represents the asynchronous package call supplied by the parent screen.
    const submitJob = vi.fn<(message: string) => Promise<void>>(() => {
      // Hold the promise so the form's pending state can be observed reliably.
      return new Promise((resolve) => {
        // The test releases this request after checking duplicate protection.
        acceptSubmission = resolve;
      });
    });
    // screen exposes accessible locators scoped to this mounted form.
    const screen = await render(<JobForm onSubmit={submitJob} />);
    await screen.getByRole("textbox", { name: "Message" }).fill("one job");
    await screen.getByRole("button", { name: "Create job" }).click();
    await expect.element(screen.getByRole("button", { name: "Creating job..." })).toBeDisabled();
    await expect.element(screen.getByRole("textbox", { name: "Message" })).toBeDisabled();
    acceptSubmission?.();
    await expect.element(screen.getByRole("button", { name: "Create job" })).toBeEnabled();
    expect(submitJob).toHaveBeenCalledTimes(1);
  });
});
