import { Phone, MessageCircle, MapPin, Mail } from "lucide-react";

const PHONE = "0202858011";
const WA_LINK = `https://wa.me/233202858011?text=${encodeURIComponent("Hi Zygo Express, I'd like to make a delivery enquiry.")}`;
const BOOK_URL = "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html";

export const Footer = () => (
  <footer className="bg-gray-900 text-white">
    <div className="container py-12 grid md:grid-cols-4 gap-8">
      {/* Brand */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#f97316] rounded-lg grid place-items-center font-extrabold text-sm">Z</div>
          <span className="font-extrabold text-lg">Zygo<span className="text-[#f97316]">Express</span></span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Wa's fastest delivery service. Legally registered. Real-time tracking. From GHS 13.
        </p>
        {/* MTN MoMo badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 text-xs font-bold text-yellow-400">
          📱 MTN MoMo Accepted
        </div>
      </div>

      {/* Services */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Services</div>
        {["Express Delivery", "Business Delivery", "Medical Delivery", "Returns & Pickups", "Partner with Us"].map(s => (
          <a key={s} href={BOOK_URL} className="block text-sm text-gray-400 hover:text-white transition-colors">{s}</a>
        ))}
      </div>

      {/* Company */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Company</div>
        {[
          { label: "About Us",    href: "#about" },
          { label: "Track Parcel", href: "#track" },
          { label: "Book Delivery", href: BOOK_URL },
          { label: "FAQ", href: "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/faq.html" },
          { label: "Partner with Us", href: "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/partnership.html" },
        ].map(l => (
          <a key={l.label} href={l.href} className="block text-sm text-gray-400 hover:text-white transition-colors">{l.label}</a>
        ))}
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Contact</div>
        <a href={`tel:${PHONE}`} className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-gray-800 rounded-xl grid place-items-center group-hover:bg-[#f97316] transition-colors flex-shrink-0">
            <Phone className="h-4 w-4 text-gray-400 group-hover:text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Call us</div>
            <div className="text-sm font-bold text-white">{PHONE}</div>
          </div>
        </a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-gray-800 rounded-xl grid place-items-center group-hover:bg-green-500 transition-colors flex-shrink-0">
            <MessageCircle className="h-4 w-4 text-gray-400 group-hover:text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500">WhatsApp</div>
            <div className="text-sm font-bold text-white">{PHONE}</div>
          </div>
        </a>
        <a href="mailto:zygoexpresssupport@gmail.com" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-gray-800 rounded-xl grid place-items-center group-hover:bg-[#f97316] transition-colors flex-shrink-0">
            <Mail className="h-4 w-4 text-gray-400 group-hover:text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="text-sm font-bold text-white">zygoexpresssupport@gmail.com</div>
          </div>
        </a>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gray-800 rounded-xl grid place-items-center flex-shrink-0">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="text-sm font-bold text-white">Wa, Upper West, Ghana</div>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-800 py-5">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <span>© {new Date().getFullYear()} Zygo Express. Legally registered in Wa, Upper West Ghana.</span>
        <span>Built with ❤️ for Wa</span>
      </div>
    </div>
  </footer>
);
