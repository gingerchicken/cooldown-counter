/** Return a user-facing error for messages the backend would reject. */
export function validateMessage(message: string): string | null {
  // Django trims input before enforcing the same nonblank and length rules.
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    // Catch whitespace locally while keeping backend validation authoritative.
    return "Enter a message.";
  }
  // Python counts Unicode code points, while JavaScript .length counts UTF-16 units.
  const characterCount = Array.from(trimmedMessage).length;
  if (characterCount > 200) {
    // Match Django for non-BMP characters such as emoji instead of rejecting early.
    return "Use 200 characters or fewer.";
  }
  return null;
}
