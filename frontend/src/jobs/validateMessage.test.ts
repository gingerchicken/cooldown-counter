import { describe, expect, it } from "vitest";
import { validateMessage } from "./validateMessage";

describe("message validation", () => {
  // Keep local validation aligned with the backend character and blank-input rules.
  // These boundaries match the API rule rather than implementation structure.
  it.each(["", " ", "\n\t"])("rejects a blank message %j", (message) => {
    expect(validateMessage(message)).toBe("Enter a message.");
  });

  it("accepts the maximum length after trimming", () => {
    // Spaces around the message are discarded by both form and serializer.
    expect(validateMessage(`  ${"a".repeat(200)}  `)).toBeNull();
  });

  it("rejects a message beyond the accepted length", () => {
    // A single extra character must not be silently truncated.
    expect(validateMessage("a".repeat(201))).toBe("Use 200 characters or fewer.");
  });

  it("counts Unicode code points like Django rather than UTF-16 units", () => {
    // An emoji occupies two JavaScript units but one Python character.
    expect(validateMessage("😀".repeat(200))).toBeNull();
    expect(validateMessage("😀".repeat(201))).toBe("Use 200 characters or fewer.");
  });
});
