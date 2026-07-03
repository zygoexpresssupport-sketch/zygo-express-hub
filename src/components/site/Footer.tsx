import { Phone, MapPin, Mail } from "lucide-react";
<a href="/legal.html" style="color:#78716c;text-decoration:none;">Legal &amp; Policies</a>
const PHONE = "0202858011";
const WA_LINK = `https://wa.me/233202858011?text=${encodeURIComponent("Hi Zygo Express, I'd like to make a delivery enquiry.")}`;
const BOOK_URL = "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html";

const SOCIALS = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@zygo.express?_r=1&_t=ZS-97HSr2Blq4I",
    bg: "#000000",
    hover: "#1a1a1a",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/ZygoExpress",
    bg: "#1877F2",
    hover: "#0d6fd8",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/ZygoExpress",
    bg: "#000000",
    hover: "#333",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: WA_LINK,
    bg: "#25D366",
    hover: "#1ebe57",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
];

export const Footer = () => (
  <footer className="bg-gray-900 text-white">
    <div className="container py-12 grid md:grid-cols-3 gap-8">

      {/* Brand + Social */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg grid place-items-center font-extrabold text-sm text-white" style={{ background: "#f97316" }}>Z</div>
          <span className="font-extrabold text-lg">Zygo<span style={{ color: "#f97316" }}>Express</span></span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Wa's fastest delivery service. Legally registered. Real-time tracking. From GHS 13.
        </p>
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 text-xs font-bold text-yellow-400">
          📱 MTN MoMo Accepted · 0202858011
        </div>

        {/* Social icons */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Follow Us</p>
          <div className="flex gap-3 flex-wrap">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="h-10 w-10 rounded-xl grid place-items-center transition-opacity hover:opacity-85"
                style={{ background: s.bg }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Company links */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Company</p>
        {[
          { label: "About Us",        href: "#about" },
          { label: "Track Parcel",    href: "#track" },
          { label: "Book Delivery",   href: BOOK_URL },
          { label: "FAQ",             href: "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/faq.html" },
          { label: "Partner with Us", href: "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/partnership.html" },
        ].map((l) => (
          <a key={l.label} href={l.href} className="block text-sm text-gray-400 hover:text-white transition-colors">
            {l.label}
          </a>
        ))}
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Contact</p>
        <a href={`tel:${PHONE}`} className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-gray-800 group-hover:bg-orange-500 rounded-xl grid place-items-center transition-colors flex-shrink-0">
            <Phone className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Call us</div>
            <div className="text-sm font-bold text-white">{PHONE}</div>
          </div>
        </a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-gray-800 group-hover:bg-green-500 rounded-xl grid place-items-center transition-colors flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="#4ade80" width="18" height="18">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">WhatsApp</div>
            <div className="text-sm font-bold text-white">{PHONE}</div>
          </div>
        </a>
        <a href="mailto:zygoexpresssupport@gmail.com" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-gray-800 group-hover:bg-orange-500 rounded-xl grid place-items-center transition-colors flex-shrink-0">
            <Mail className="h-4 w-4 text-gray-400" />
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
