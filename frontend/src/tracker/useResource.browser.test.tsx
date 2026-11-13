import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ApiError } from "@template/api-client";
import { useResource } from "./useResource";

/** Exercise real hook generations through visible resource transitions in a browser. */
function ResourceHarness({
  load,
  alternate,
  interval,
}: {
  load: (signal: AbortSignal) => Promise<string>;
  alternate?: (signal: AbortSignal) => Promise<string>;
  interval?: number;
}) {
  // Resource changes are real user events, with stable function references supplied by each case.
  const [other, setOther] = useState(false);
  const resource = useResource(other && alternate ? alternate : load, interval);
  return (
    <section>
      {resource.pending && <p role="status">Pending</p>}
      {resource.data && <p>{resource.data}</p>}
      {resource.error && <p role="alert">{resource.error}</p>}
      <button onClick={resource.retry}>Retry resource</button>
      <button
        onClick={() => {
          setOther(true);
        }}
      >
        Other resource
      </button>
    </section>
  );
}

describe("protected resource state in Chromium", () => {
  it("removes an accepted snapshot after authoritative membership revocation", async () => {
    // A later 404 deliberately hides whether the previously accessible fleet still exists.
    const load = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockResolvedValueOnce("Private fleet evidence")
      .mockRejectedValueOnce(new ApiError(404));
    const screen = await render(<ResourceHarness load={load} />);
    await expect
      .element(screen.getByText("Private fleet evidence"))
      .toBeVisible();
    await screen.getByRole("button", { name: "Retry resource" }).click();
    await expect.element(screen.getByRole("alert")).toBeVisible();
    await expect
      .element(screen.getByText("Private fleet evidence"))
      .not.toBeInTheDocument();
  });
  it("retains a same-resource snapshot on a transient service failure", async () => {
    // A 503 cannot prove lost authorization, so it differs from the revocation case above.
    const load = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockResolvedValueOnce("Accepted snapshot")
      .mockRejectedValueOnce(new ApiError(503));
    const screen = await render(<ResourceHarness load={load} />);
    await expect.element(screen.getByText("Accepted snapshot")).toBeVisible();
    await screen.getByRole("button", { name: "Retry resource" }).click();
    await expect.element(screen.getByRole("alert")).toBeVisible();
    await expect.element(screen.getByText("Accepted snapshot")).toBeVisible();
  });
  it("does not attach old data to a new range or fleet while its load is pending", async () => {
    // The second resource remains unresolved while the first snapshot must already be hidden.
    let acceptOther: (snapshot: string) => void = () => {
      throw new Error("Second read not started");
    };
    const first = vi.fn().mockResolvedValue("First tenant"),
      second = vi.fn(
        () =>
          new Promise<string>((resolve) => {
            acceptOther = resolve;
          }),
      );
    const screen = await render(
      <ResourceHarness load={first} alternate={second} />,
    );
    await expect.element(screen.getByText("First tenant")).toBeVisible();
    await screen.getByRole("button", { name: "Other resource" }).click();
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Pending");
    await expect
      .element(screen.getByText("First tenant"))
      .not.toBeInTheDocument();
    acceptOther("Second tenant");
    await expect.element(screen.getByText("Second tenant")).toBeVisible();
  });
  it("cannot restore private data from an older response after a newer denied generation", async () => {
    // The first request intentionally ignores abort, modelling a response already being delivered.
    let acceptOld: (snapshot: string) => void = () => {
      throw new Error("Old read not started");
    };
    const load = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockImplementationOnce(
        () =>
          new Promise<string>((resolve) => {
            acceptOld = resolve;
          }),
      )
      .mockRejectedValueOnce(new ApiError(404));
    const screen = await render(<ResourceHarness load={load} />);
    await screen.getByRole("button", { name: "Retry resource" }).click();
    await expect.element(screen.getByRole("alert")).toBeVisible();
    acceptOld("Obsolete private result");
    await expect
      .element(screen.getByText("Obsolete private result"))
      .not.toBeInTheDocument();
  });
  it("does not overlap polls while an earlier request remains unsettled", async () => {
    // The short polling interval makes overlap observable without a long-running test.
    const load = vi.fn<(signal: AbortSignal) => Promise<string>>(
      () => new Promise(() => {}),
    );
    await render(<ResourceHarness load={load} interval={5} />);
    await new Promise((resolve) => setTimeout(resolve, 35));
    expect(load).toHaveBeenCalledTimes(1);
  });
});
