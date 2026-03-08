import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { categories } from "@/data/articles";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      {/* Ad slot - header */}
      <div className="container py-2">
        <div className="ad-slot h-[90px]">Advertisement Space — Header Banner (728×90)</div>
      </div>

      <nav className="container flex items-center justify-between py-4">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight text-foreground">
          The<span className="text-accent">Daily</span>Blog
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Home</Link>
          <Link to="/blog" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Blog</Link>
          {categories.slice(0, 4).map(cat => (
            <Link key={cat} to={`/blog?category=${cat}`} className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">{cat}</Link>
          ))}
          <Link to="/about" className="text-sm font-medium text-foreground hover:text-accent transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-md hover:bg-secondary transition-colors" aria-label="Search">
            <Search className="w-5 h-5 text-foreground" />
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Search bar */}
      {searchOpen && (
        <div className="container pb-4 animate-fade-in">
          <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/blog?search=${encodeURIComponent(searchQuery.trim())}`; }}>
            <input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border animate-fade-in">
          <div className="container py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">Home</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">Blog</Link>
            {categories.map(cat => (
              <Link key={cat} to={`/blog?category=${cat}`} onClick={() => setMobileOpen(false)} className="text-sm py-2 text-muted-foreground pl-3">{cat}</Link>
            ))}
            <Link to="/about" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">About</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-foreground">Contact</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
