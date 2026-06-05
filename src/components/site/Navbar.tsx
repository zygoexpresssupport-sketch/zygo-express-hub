import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Track", href: "#track" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Partner", href: "#partner" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);

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
          {LINKS.map(l => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="hero" size="sm" asChild>
            <a href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html">
              Book Delivery
            </a>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Button variant="hero" className="w-full" asChild>
            <a href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html">
              Book Delivery
            </a>
          </Button>
        </div>
      )}
    </nav>
  );
};
