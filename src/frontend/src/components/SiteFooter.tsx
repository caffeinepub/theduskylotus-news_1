import { SiInstagram } from "react-icons/si";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-wine-darkest text-cream-DEFAULT">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <img
              src="/assets/untitled-1-019d484f-22fa-72db-8264-fbea345379a1.png"
              alt="The Dusky Lotus News"
              className="h-14 w-auto brightness-150 opacity-90"
            />
            <p className="category-meta text-cream-DEFAULT/60 text-[0.65rem] tracking-[0.18em]">
              INDEPENDENT EDITORIAL SINCE 2025
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              "About",
              "Contact",
              "Archives",
              "Politics",
              "World",
              "Culture",
            ].map((item) => (
              <a
                key={item}
                href="/"
                className="category-meta text-cream-DEFAULT/70 hover:text-wine-vibrant transition-colors text-[0.65rem] tracking-widest"
              >
                {item.toUpperCase()}
              </a>
            ))}
          </nav>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-cream-DEFAULT/60 hover:text-wine-vibrant transition-colors"
            >
              <SiInstagram size={20} />
            </a>
          </div>
        </div>

        <div className="border-t border-cream-DEFAULT/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-cream-DEFAULT/40 text-xs font-sans">
            © {year} The Dusky Lotus News. All rights reserved.
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream-DEFAULT/30 text-xs hover:text-cream-DEFAULT/60 transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
