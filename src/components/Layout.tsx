import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}

const Layout = ({ children, hideNavbar = false, hideFooter = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
