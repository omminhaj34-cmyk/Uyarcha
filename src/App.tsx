import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";

/* Lazy pages */
const Blog = React.lazy(() => import("./pages/Blog"));
const ArticlePage = React.lazy(() => import("./pages/ArticlePage"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const Admin = React.lazy(() => import("./pages/Admin"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

/* Safe loader */
const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        <p className="text-sm text-muted-foreground">
          Loading page...
        </p>
      </div>
    </div>
  );
};

/* Safe route wrapper */
const SafeRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>

          <Routes>

            <Route
              path="/"
              element={<Index />}
            />

            <Route
              path="/blog"
              element={
                <SafeRoute>
                  <Blog />
                </SafeRoute>
              }
            />

            <Route
              path="/article/:slug"
              element={
                <SafeRoute>
                  <ArticlePage />
                </SafeRoute>
              }
            />

            <Route
              path="/about"
              element={
                <SafeRoute>
                  <About />
                </SafeRoute>
              }
            />

            <Route
              path="/contact"
              element={
                <SafeRoute>
                  <Contact />
                </SafeRoute>
              }
            />

            <Route
              path="/privacy-policy"
              element={
                <SafeRoute>
                  <PrivacyPolicy />
                </SafeRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <SafeRoute>
                  <Admin />
                </SafeRoute>
              }
            />

            <Route
              path="*"
              element={
                <SafeRoute>
                  <NotFound />
                </SafeRoute>
              }
            />

          </Routes>

        </BrowserRouter>

      </TooltipProvider>
    </HelmetProvider>
  );
}

export default App;