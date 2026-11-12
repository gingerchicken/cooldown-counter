import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// The HTML shell owns this element; a missing mount point is a build error.
const rootElement = document.getElementById("root");
if (!rootElement) {
  // Fail clearly instead of silently rendering a blank page with a bad shell.
  throw new Error("The frontend mount element is missing.");
}

// Strict Mode also checks effect cleanup when developing the polling screen.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
