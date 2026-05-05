import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "/zygo-icon.png";

const links = [
  { href: "#services", label: "Services" },
  { href: "#track", label: "Track" },
  { href: "#quote", label: "Get Quote" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <nav className="container flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2 font-extrabold text-lg">
          <img src={logo} alt="Zygo Express logo" className="h-9 w-9" width={36} height={36} />
          <span>Zygo<span className="text-gradient">Express</span></span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              {l.label}
            </a>
          ))}
          <Button variant="hero" size="sm" asChild>
            <a href="#quote">Ship Now</a>
          </Button>
        </div>
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-up">
          <div className="container py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 text-base font-medium">
                {l.label}
              </a>
            ))}
            <Button variant="hero" asChild onClick={() => setOpen(false)}>
              <a href="#quote">Ship Now</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};