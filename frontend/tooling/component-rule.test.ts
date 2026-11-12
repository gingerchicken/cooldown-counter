import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

describe("one component per source file", () => {
  // Check the active repository rule rather than a duplicated test-only configuration.
  it("rejects a second unexported stateless component", async () => {
    // Test the repository's real ESLint config so future overrides cannot relax it.
    // eslint loads the same flat configuration used by the command-line lint script.
    const eslint = new ESLint();
    // reports captures diagnostics for a synthetic source file without adding invalid fixtures.
    const reports = await eslint.lintText("export function First() { return <div />; }\nfunction Second() { return <span />; }\n", { filePath: "src/TwoComponents.tsx" });
    expect(reports[0].messages.some((message) => message.ruleId === "react/no-multi-comp")).toBe(true);
  });

  it("rejects a component nested inside another component", async () => {
    // Nested definitions also reset React state and must remain separate files.
    // eslint loads the same flat configuration used by the command-line lint script.
    const eslint = new ESLint();
    // reports captures diagnostics for a synthetic source file without adding invalid fixtures.
    const reports = await eslint.lintText("export function Parent() { function Child() { return <span />; } return <Child />; }\n", { filePath: "src/NestedComponents.tsx" });
    expect(reports[0].messages.some((message) => message.ruleId === "react/no-multi-comp")).toBe(true);
  });
});
