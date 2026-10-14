import { Link } from "react-router-dom";

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorFallback = ({ message = "Something went wrong", onRetry }: ErrorFallbackProps) => {
  return (
    <div className="container py-20 text-center">
      <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-8 shadow-soft">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 font-display text-destructive">Oops!</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-6 py-2 bg-accent text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md shadow-accent/20"
            >
              Try Again
            </button>
          )}
          <Link 
            to="/" 
            className="px-6 py-2 border border-border rounded-lg font-semibold hover:bg-muted transition-all"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
