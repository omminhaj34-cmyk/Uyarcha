import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold mb-3">
              Uyarcha
            </h3>
            <p className="text-primary-foreground/70 max-w-sm text-sm leading-relaxed">
              Uyarcha — Ideas that rise. Delivering thoughtful articles on technology, business, health, travel, and lifestyle.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61575456004486", label: "Facebook" },
                { Icon: XIcon, href: "https://x.com/uyarcha82791", label: "X (Twitter)" },
                { Icon: Instagram, href: "https://www.instagram.com/uyarchatech?igsh=MWZhdWxrYTNiaGZiaA==", label: "Instagram" },
                { Icon: Youtube, href: "https://www.youtube.com/@uyarchatech", label: "Youtube" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target={social.href !== "#" ? "_blank" : undefined}
                  rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                  className="p-2 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors" 
                  aria-label={social.label}
                >
                  <social.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <h4 className="font-display font-semibold mb-4 text-left">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/" className="hover:text-accent transition-colors text-left w-fit">Home</Link>
              <Link to="/blog" className="hover:text-accent transition-colors text-left w-fit">Blog</Link>
              <Link to="/about" className="hover:text-accent transition-colors text-left w-fit">About</Link>
              <Link to="/contact" className="hover:text-accent transition-colors text-left w-fit">Contact</Link>
              <Link to="/privacy-policy" className="hover:text-accent transition-colors text-left w-fit">Privacy Policy</Link>
            </div>
          </div>
          <div className="md:col-span-1">
             <h4 className="font-display font-semibold mb-4 text-left">Connect</h4>
             <p className="text-sm text-primary-foreground/70 leading-relaxed">
               Feel free to reach out to us for any inquiries or collaborations. We're always open to new ideas and connections.
             </p>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Uyarcha. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
