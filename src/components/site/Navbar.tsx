import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const MAIN_LINKS = [
  { label: "Track", href: "#track" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
];

const MORE_LINKS = [
  { label: "Partner with Us", href: "#partner" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [open, setOpen]       = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">

        {/* Logo */}
        <a href="#top" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center text-primary-foreground font-extrabold text-sm">Z</div>
          <span className="font-extrabold text-lg tracking-tight">Zygo<span className="text-primary">Express</span></span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {MAIN_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropOpen(!dropOpen)}
              onBlur={() => setTimeout(() => setDropOpen(false), 150)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              More
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} />
            </button>
            {dropOpen && (
              <div className="absolute top-9 left-0 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[180px] z-50">
                {MORE_LINKS.map(l => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setDropOpen(false)}
                    className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg mx-1"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="hero" size="sm" asChild>
            <a
              href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Delivery
            </a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          {MAIN_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}

          {/* More section on mobile */}
          <div className="border-t border-border pt-3 mt-1">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              More
            </div>
            {MORE_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <Button variant="hero" className="w-full" asChild>
              <a
                href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Delivery
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};