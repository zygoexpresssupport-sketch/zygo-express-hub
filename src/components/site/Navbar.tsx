import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const MAIN_LINKS = [
  { label: "Track",    href: "#track" },
  { label: "Services", href: "#services" },
  { label: "About",    href: "#about" },
];

const MORE_LINKS = [
  { label: "🤝 Partner with Us", href: "#partner" },
  { label: "❓ FAQ",             href: "#faq" },
];

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center text-primary-foreground font-extrabold text-sm">Z</div>
          <span className="font-extrabold text-lg tracking-tight">Zygo<span className="text-primary">Express</span></span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {MAIN_LINKS.map(l => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
          ))}
          <div className="relative" ref={dropRef}>
            <button
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMoreOpen(v => !v)}
            >
              More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-9 right-0 w-52 bg-card border border-border rounded-xl shadow-card overflow-hidden z-50">
                {MORE_LINKS.map(l => (
                  <a key={l.label} href={l.href}
                    className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors border-b border-border last:border-0"
                    onClick={() => setMoreOpen(false)}>
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block">
          <Button variant="hero" size="sm" asChild>
            <a href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html">Book Now</a>
          </Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          {MAIN_LINKS.map(l => (
            <a key={l.label} href={l.href} className="block py-2.5 text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <div className="border-t border-border pt-2 mt-2 space-y-1">
            {MORE_LINKS.map(l => (
              <a key={l.label} href={l.href} className="block py-2.5 text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
          </div>
          <div className="pt-3">
            <Button variant="hero" className="w-full" asChild>
              <a href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html">Book Delivery</a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
