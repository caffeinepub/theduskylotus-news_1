import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

const NAV_LINKS = [
  { label: "Politics", href: "/?category=Politics" },
  { label: "World", href: "/?category=World" },
  { label: "Culture", href: "/?category=Culture" },
  { label: "Voices", href: "/?category=Voices" },
  { label: "The Arts", href: "/?category=The Arts" },
  { label: "Design", href: "/?category=Design" },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-cream-light border-b-2 border-wine sticky top-0 z-50">
      {/* Top strip */}
      <div className="bg-wine-darkest py-1 text-center">
        <span className="category-meta text-cream-DEFAULT text-[0.65rem] tracking-[0.2em]">
          THE DUSKY LOTUS · INDEPENDENT EDITORIAL
        </span>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        {/* Main header row */}
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/assets/untitled-1-019d484f-22fa-72db-8264-fbea345379a1.png"
              alt="The Dusky Lotus News"
              className="h-16 md:h-20 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0">
            {NAV_LINKS.map((link, i) => (
              <span key={link.label} className="flex items-center">
                <a
                  href={link.href}
                  data-ocid="nav.link"
                  className="category-meta text-wine-darkest hover:text-wine-vibrant transition-colors px-3 py-1"
                >
                  {link.label.toUpperCase()}
                </a>
                {i < NAV_LINKS.length - 1 && (
                  <span className="text-wine opacity-40 text-xs">|</span>
                )}
              </span>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              className="text-wine-dark hover:text-wine-vibrant transition-colors p-1"
            >
              <Search size={18} />
            </button>

            {identity ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: "/admin" })}
                    data-ocid="admin.link"
                    className="category-meta border-wine-DEFAULT text-wine-DEFAULT hover:bg-wine-DEFAULT hover:text-cream-DEFAULT text-[0.65rem] tracking-wider"
                  >
                    DASHBOARD
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  data-ocid="logout.button"
                  className="category-meta text-wine-dark text-[0.65rem] tracking-wider"
                >
                  LOG OUT
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate({ to: "/admin/login" })}
                data-ocid="admin.button"
                className="category-meta bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT text-[0.65rem] tracking-[0.12em] px-4 py-1.5"
              >
                ADMIN
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden text-wine-dark p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-wine/30 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="category-meta text-wine-darkest hover:text-wine-vibrant transition-colors py-2 px-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label.toUpperCase()}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
