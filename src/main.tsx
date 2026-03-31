import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";
import { validateEnv } from "./lib/config";

// Step 8: Validate ENV on start
try {
    validateEnv();
} catch (e) {
    console.error("BOOTSTRAP FAILED:", e);
}

// Step 5 & 6: Global & Promise Error Logic
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error("GLOBAL APP ERROR:", { msg, url, lineNo, columnNo, error });
  return false;
};

window.onunhandledrejection = function(event) {
  console.error("UNHANDLED PROMISE REJECTION:", event.reason);
};

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");
  
  // Step 2 & 12: Verify main entry and add global error boundary
  createRoot(rootElement).render(
    <ErrorBoundary fallback={<div className="p-8 text-center font-bold">Something went wrong (Global)</div>}>
      <App />
    </ErrorBoundary>
  );
  console.log("App rendered to DOM");
} catch (err) {
  console.error("CRITICAL BOOTSTRAP ERROR:", err);
}
