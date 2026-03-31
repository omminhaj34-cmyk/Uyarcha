import Layout from "./Layout";

const PageLoader = ({ message = "Loading content..." }: { message?: string }) => {
  return (
    <Layout>
      <div className="container py-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="text-muted-foreground animate-pulse text-lg">{message}</p>
        </div>
      </div>
    </Layout>
  );
};

export default PageLoader;
