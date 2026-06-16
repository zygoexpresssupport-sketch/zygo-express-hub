import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, Home, MapPin, BookOpen, MoreHorizontal } from "lucide-react";

const MAIN_LINKS = [
  { label: "Track",    href: "#track" },
  { label: "Services", href: "#services" },
  { label: "About",    href: "#about" },
];

const MORE_LINKS = [
  { label: "🤝 Partner with Us", href: "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/partnership.html" },
  { label: "❓ FAQ",             href: "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/faq.html" },
  { label: "📞 Call Us",         href: "tel:0202858011" },
  { label: "💬 WhatsApp",        href: "https://wa.me/233202858011?text=Hi%20Zygo%20Express" },
];

const BOOK_URL = "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <>
      {/* Top navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <a href="#top" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#f97316] grid place-items-center text-white font-extrabold text-sm">Z</div>
            <span className="font-extrabold text-lg tracking-tight text-gray-900">Zygo<span className="text-[#f97316]">Express</span></span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {MAIN_LINKS.map(l => (
              <a key={l.label} href={l.href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{l.label}</a>
            ))}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setMoreOpen(v => !v)}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <div className="absolute top-9 right-0 w-52 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                  {MORE_LINKS.map(l => (
                    <a key={l.label} href={l.href}
                      className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#f97316] transition-colors border-b border-gray-50 last:border-0"
                      onClick={() => setMoreOpen(false)}>
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <a href={BOOK_URL} className="bg-[#f97316] hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
              Book Now
            </a>
          </div>

          <button className="md:hidden p-2 text-gray-700" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            {MAIN_LINKS.map(l => (
              <a key={l.label} href={l.href} className="block py-2.5 text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
              {MORE_LINKS.map(l => (
                <a key={l.label} href={l.href} className="block py-2.5 text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>{l.label}</a>
              ))}
            </div>
            <div className="pt-3">
              <a href={BOOK_URL} className="block w-full text-center bg-[#f97316] text-white font-bold py-3 rounded-xl">Book Delivery</a>
            </div>
          </div>
        )}
      </nav>

      {/* Sticky bottom nav — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg pb-safe">
        <div className="grid grid-cols-4 h-16">
          <a href="#top" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#f97316] transition-colors">
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </a>
          <a href="#track" className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#f97316] transition-colors">
            <MapPin className="h-5 w-5" />
            <span className="text-[10px] font-medium">Track</span>
          </a>
          <a href={BOOK_URL}
            className="flex flex-col items-center justify-center gap-1 bg-[#f97316] text-white mx-2 my-2 rounded-xl shadow-lg shadow-orange-200"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[10px] font-bold">Book</span>
          </a>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#f97316] transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Bottom nav spacer on mobile */}
      <div className="md:hidden h-16" />
    </>
  );
};
