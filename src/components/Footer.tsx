import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold mb-3">
              The<span className="text-accent">Daily</span>Blog
            </h3>
            <p className="text-primary-foreground/70 max-w-sm text-sm leading-relaxed">
              Delivering thoughtful articles on technology, business, health, travel, and lifestyle. Stay informed, stay inspired.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Social link">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              <Link to="/blog" className="hover:text-accent transition-colors">Blog</Link>
              <Link to="/about" className="hover:text-accent transition-colors">About</Link>
              <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
              <Link to="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-primary-foreground/70 mb-3">Get the latest articles delivered to your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button type="submit" className="px-4 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} TheDailyBlog. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
