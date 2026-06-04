import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Home", href: "#top" },
    { label: "Services", href: "#services" },
    { label: "Track Parcel", href: "#track" },
    { label: "About", href: "#about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">

        {/* Logo */}
        <a href="#top" className="flex items-center gap-2 font-extrabold text-xl">
          <div className="h-8 w-8 rounded-full bg-gradient-hero grid place-items-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-gradient">Zygo Express</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/admin3.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Admin
            </a>
          </Button>
          <Button size="sm" asChild>
            <a
              href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Now
            </a>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/admin3.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Admin
              </a>
            </Button>
            <Button size="sm" asChild>
              <a
                href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Now
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};