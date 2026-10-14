import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", to: "/", end: true },
  { label: "Jobs", to: "/jobs" },
  { label: "Internship", to: "/internship" },
  { label: "Certificate", to: "/certificates" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Handle Escape key to close open menus/overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/blog?search=${encodeURIComponent(trimmed)}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        {/* Uyarcha Brand Logo */}
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          aria-label="Uyarcha Home"
        >
          Uyarcha
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-3.5 lg:gap-6 xl:gap-8"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-1 ${
                  isActive
                    ? "text-accent font-semibold"
                    : "font-medium text-foreground hover:text-accent"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Icons (Search & Mobile Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="p-2 rounded-md text-foreground hover:bg-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={searchOpen ? "Close search bar" : "Open search bar"}
            aria-expanded={searchOpen}
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop & Mobile Search Dropdown */}
      {searchOpen && (
        <div className="border-t border-border bg-background animate-fade-in">
          <div className="container py-3">
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <input
                type="search"
                placeholder="Search articles, tutorials, and topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                autoFocus
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>
          </div>
        </div>
      )}

      {/* Mobile Responsive Navigation Panel */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          role="navigation"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-border bg-card animate-fade-in shadow-lg"
        >
          <div className="container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-base py-2.5 px-3 rounded-md transition-colors ${
                    isActive
                      ? "text-accent bg-accent/10 font-semibold"
                      : "text-foreground font-medium hover:bg-secondary hover:text-accent"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* Mobile Integrated Search */}
            <div className="pt-3 mt-2 border-t border-border">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
