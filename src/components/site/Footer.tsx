import { Facebook, Twitter, Music2, Mail, Phone } from "lucide-react";
import logo from "/zygo-icon.png";

export const Footer = () => (
  <footer id="contact" className="bg-secondary text-secondary-foreground pt-16 pb-8">
    <div className="container grid md:grid-cols-4 gap-10">
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center gap-2 font-extrabold text-xl">
          <img src={logo} alt="" className="h-9 w-9" width={36} height={36} />
          Zygo<span className="text-gradient">Express</span>
        </div>
        <p className="opacity-90 max-w-sm">Last-mile delivery for businesses and people who can't afford to slow down.</p>
        <div className="flex gap-3 pt-2">
          <a href="https://www.tiktok.com/@zygo.express" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="h-12 w-12 rounded-full bg-black text-white hover:scale-110 grid place-items-center transition-smooth shadow-card">
            <Music2 className="h-5 w-5" />
          </a>
          <a href="https://x.com/ZygoExpress" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="h-12 w-12 rounded-full bg-[#000000] text-white hover:scale-110 grid place-items-center transition-smooth shadow-card">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="https://www.facebook.com/ZygoExpress" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-12 w-12 rounded-full bg-[#1877F2] text-white hover:scale-110 grid place-items-center transition-smooth shadow-card">
            <Facebook className="h-5 w-5" />
          </a>
        </div>
      </div>
      <div className="space-y-3">
        <div className="font-bold">Company</div>
        <a href="#services" className="block opacity-90 hover:opacity-100">Services</a>
        <a href="#about" className="block opacity-90 hover:opacity-100">About</a>
        <a href="#track" className="block opacity-90 hover:opacity-100">Track parcel</a>
        <a href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html" target="_blank" rel="noopener noreferrer" className="block opacity-90 hover:opacity-100">Get a quote</a>
      </div>
      <div className="space-y-3">
        <div className="font-bold">Contact</div>
        <a href="mailto:zygoexpresssupport@gmail.com" className="flex items-center gap-2 opacity-90 hover:opacity-100">
          <Mail className="h-4 w-4" /> zygoexpresssupport@gmail.com
        </a>
        <a href="tel:+233202858011" className="flex items-center gap-2 opacity-90 hover:opacity-100">
          <Phone className="h-4 w-4" /> +233 20 285 8011
        </a>
      </div>
    </div>
    <div className="container mt-12 pt-6 border-t border-background/10 flex flex-col sm:flex-row justify-between gap-3 text-sm opacity-90">
      <div>© {new Date().getFullYear()} Zygo Express. All rights reserved.</div>
      <div>Driven to deliver.</div>
    </div>
  </footer>
);