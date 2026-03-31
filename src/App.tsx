import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ErrorBoundary } from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import { checkDatabaseHealth } from "./lib/db";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";

/* Lazy pages */
const Blog = React.lazy(() => import("./pages/Blog"));
const ArticlePage = React.lazy(() => import("./pages/ArticlePage"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const Admin = React.lazy(() => import("./pages/Admin"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Certificates = React.lazy(() => import("@/pages/Certificates"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 30, // 30 mins prevents cache memory leaks
      retry: 2, 
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false, // Prevent redundant fetches on navigational back/forth
    },
    mutations: {
      retry: 0, 
    }
  },
});

/* Safe route wrapper with step 10 Error UI */
const SafeRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary fallback={
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
                <p className="text-muted-foreground">The application encountered an unexpected error. Please refresh or try again later.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-all">Refresh App</button>
            </div>
        </div>
    }>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  // Step 10 & 18 - CONSOLE DEBUG
  console.log("APP START");
  console.log("ENV:", import.meta.env);

  const [dbHealthy, setDbHealthy] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Step 16: Database Health Check on start
    const check = async () => {
        const healthy = await checkDatabaseHealth();
        setDbHealthy(healthy);
    };
    check();
  }, []);

  /* Step: Global blocker removed to allow app to render and stabilize. 
     Individual components handle their own connection status. */
  /*
  if (dbHealthy === false) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">System Maintenance</h2>
                <p className="text-muted-foreground">Uyarcha is currently undergoing scheduled maintenance or database connection is unstable. Please check back in a few minutes.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 border rounded-lg font-bold hover:bg-muted">Try Again</button>
            </div>
        </div>
    );
  }
  */

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/article/:slug" element={<ArticlePage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>

        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;