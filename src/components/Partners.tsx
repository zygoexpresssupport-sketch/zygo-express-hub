import { useState } from "react";

/* ─── GitHub Pages base URL for logos ─── */
const BASE = "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public";

const PARTNERS = [
  {
    id: "stc",
    name: "Intercity STC",
    category: "Transport & Logistics",
    tagline: "Ghana's premier national bus carrier. We collect parcels arriving at Wa's STC terminal and complete the last mile straight to your door.",
    accent: "#b91c1c",
    light: "#fef2f2",
    badge: "📦 Terminal Pickup",
    logo: `${BASE}/logo-stc.png`,
    logoBg: "#ffffff",
  },
  {
    id: "vip",
    name: "VIP Jeoun Transport",
    category: "Intercity Bus Service",
    tagline: "Connecting Wa to Accra, Kumasi and beyond. Every parcel arriving on VIP buses to Wa gets collected and delivered by Zygo — door to door.",
    accent: "#dc2626",
    light: "#fff1f2",
    badge: "🚌 Parcel Collection",
    logo: `${BASE}/logo-vip.jpg`,
    logoBg: "#dc2626",
  },
  {
    id: "oa",
    name: "OA Travel & Tours",
    category: "Travel & Transport",
    tagline: "Trusted travel partner in Wa. Zygo handles parcel relay from OA's terminal, ensuring packages reach recipients safely across the city.",
    accent: "#1d4ed8",
    light: "#eff6ff",
    badge: "🚍 Relay Delivery",
    logo: `${BASE}/logo-oa.jpg`,
    logoBg: "#ffffff",
  },
  {
    id: "meditrust",
    name: "Prime Meditrust",
    category: "Healthcare & Pharmacy",
    tagline: "Trusted medical services in Wa. We deliver prescriptions, lab reports and medical supplies swiftly and with full discretion.",
    accent: "#065f46",
    light: "#ecfdf5",
    badge: "🏥 Medical Delivery",
    logo: null,
    logoBg: "#065f46",
    abbr: "PM",
  },
  {
    id: "spicy",
    name: "Spicy Foodies",
    category: "Food & Dining",
    tagline: "Wa's go-to for bold, flavourful meals. Zygo riders ensure hot food reaches you fast — no cold plates, no excuses.",
    accent: "#9a3412",
    light: "#fff7ed",
    badge: "🍽️ Food Delivery",
    logo: null,
    logoBg: "#9a3412",
    abbr: "SF",
  },
];

/* ── Ticker strip ── */
function Ticker() {
  const items = [
    "🏢 STC — Terminal Parcels",
    "🚌 VIP Jeoun — Bus Packages",
    "🚍 OA Travel — Relay Delivery",
    "🏥 Prime Meditrust — Medical",
    "🍽️ Spicy Foodies — Food",
    "📦 5 Partners & Growing",
    "⚡ Wa's Last-Mile Experts",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-orange-100 bg-orange-50 py-3 mb-10">
      <div
        className="flex gap-10 whitespace-nowrap"
        style={{ animation: "ticker 28s linear infinite", width: "max-content" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            {item}
            <span className="ml-10 text-orange-300">•</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ── Logo mark ── */
function LogoMark({ partner, hovered }: { partner: typeof PARTNERS[0]; hovered: boolean }) {
  const [imgError, setImgError] = useState(false);

  if (partner.logo && !imgError) {
    return (
      <div
        className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 border-2"
        style={{
          borderColor: hovered ? "rgba(255,255,255,0.3)" : partner.accent + "33",
          background: partner.logoBg,
          transition: "border-color 0.25s",
        }}
      >
        <img
          src={partner.logo}
          alt={partner.name + " logo"}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  /* Fallback: styled initial badge */
  return (
    <div
      style={{
        background: hovered ? "rgba(255,255,255,0.18)" : partner.light,
        color: hovered ? "#ffffff" : partner.accent,
        transition: "background 0.25s, color 0.25s",
      }}
      className="h-14 w-14 rounded-xl grid place-items-center font-black text-base tracking-tight flex-shrink-0"
    >
      {"abbr" in partner ? partner.abbr : partner.name.slice(0, 2)}
    </div>
  );
}

/* ── Partner card ── */
function PartnerCard({ p, index }: { p: typeof PARTNERS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? p.accent : "#ffffff",
        borderTop: `4px solid ${p.accent}`,
        transition: "background 0.25s ease, transform 0.25s ease",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        animationDelay: `${index * 0.1}s`,
      }}
      className="rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3.5 cursor-default"
    >
      {/* Logo + badge row */}
      <div className="flex items-start justify-between gap-2">
        <LogoMark partner={p} hovered={hovered} />
        <span
          style={{
            background: hovered ? "rgba(255,255,255,0.15)" : p.light,
            color: hovered ? "#ffffff" : p.accent,
            transition: "background 0.25s, color 0.25s",
          }}
          className="text-xs font-bold px-2.5 py-1 rounded-full leading-tight text-right"
        >
          {p.badge}
        </span>
      </div>

      {/* Name + category */}
      <div>
        <h3
          style={{ color: hovered ? "#ffffff" : "#1c1917" }}
          className="font-extrabold text-[15px] leading-snug transition-colors"
        >
          {p.name}
        </h3>
        <p
          style={{ color: hovered ? "rgba(255,255,255,0.6)" : "#78716c" }}
          className="text-xs font-semibold uppercase tracking-wider mt-0.5 transition-colors"
        >
          {p.category}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{ background: hovered ? "rgba(255,255,255,0.18)" : "#f3f4f6" }}
        className="h-px w-full transition-colors"
      />

      {/* Tagline */}
      <p
        style={{ color: hovered ? "rgba(255,255,255,0.82)" : "#57534e" }}
        className="text-[13px] leading-relaxed flex-1 transition-colors"
      >
        {p.tagline}
      </p>

      {/* CTA */}
      <a
        href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/partnership.html"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: hovered ? "#ffffff" : p.accent,
          borderColor: hovered ? "rgba(255,255,255,0.35)" : p.accent,
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold border rounded-lg px-3 py-1.5 transition-colors hover:opacity-80 w-fit"
      >
        Become a partner
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  );
}

/* ── Main export ── */
export const Partners = () => (
  <section id="partners" className="py-16 bg-gray-50">
    <div className="container">

      {/* Header */}
      <div className="text-center mb-4">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-4">
          Our Partners & Collaborators
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          Wa's businesses trust{" "}
          <span style={{ color: "#f97316" }}>Zygo Express</span>
        </h2>
        <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
          From bus terminals to pharmacies to restaurants — we're the delivery
          backbone for Wa's most trusted names.
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-10 mt-6 mb-10 flex-wrap">
        {[
          { value: "5+", label: "Active Partners" },
          { value: "100%", label: "On-Time Commitment" },
          { value: "Wa", label: "Upper West, Ghana" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-black" style={{ color: "#f97316" }}>{s.value}</div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <Ticker />

      {/* Cards — 2 cols on tablet, wraps naturally */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PARTNERS.map((p, i) => (
          <PartnerCard key={p.id} p={p} index={i} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm flex-wrap justify-center">
          <div
            className="h-10 w-10 rounded-xl grid place-items-center font-black text-white text-sm flex-shrink-0"
            style={{ background: "#f97316" }}
          >
            Z
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Want Zygo to deliver for your business?</p>
            <p className="text-xs text-gray-400">Join STC, VIP, OA Travel & more on our network.</p>
          </div>
          <a
            href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/partnership.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-sm font-bold text-white rounded-xl px-5 py-2.5 transition-opacity hover:opacity-85"
            style={{ background: "#f97316" }}
          >
            Partner with us →
          </a>
        </div>
      </div>

    </div>
  </section>
);
