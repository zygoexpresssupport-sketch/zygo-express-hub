import { useEffect, useRef } from "react";

const TESTIMONIALS = [
  {
    name: "Mohammed",
    initials: "MO",
    role: "Station Manager",
    biz: "Wa Bus Terminal",
    text: "Bus parcels used to pile up with no system. Zygo Express gave us real-time tracking and same-day pickups — our passengers never miss a delivery now.",
    stars: 5,
  },
  {
    name: "Abena Asante",
    initials: "AA",
    role: "Pharmacy Manager",
    biz: "Pharmacy · Wa",
    text: "Medication delays used to cost us customers. With Zygo Express, we dispatch prescriptions across Wa in hours. It's become part of how we operate.",
    stars: 5,
  },
  {
    name: "Ibrahim Dauda",
    initials: "ID",
    role: "Business Owner",
    biz: "Retail · Wa",
    text: "I sent a document from Wa to a client and tracked it the whole way on my phone. It arrived before I finished my tea. Zygo is just different.",
    stars: 5,
  },
  {
    name: "Fatima Seidu",
    initials: "FS",
    role: "Online Seller",
    biz: "E-commerce · Wa",
    text: "My customers now get same-day delivery. My sales have increased because people trust that their orders will arrive fast. Zygo Express made that possible.",
    stars: 5,
  },
  {
    name: "Kofi Agyeman",
    initials: "KA",
    role: "Hospital Admin",
    biz: "Medical · Wa",
    text: "We use Zygo Express for urgent medical supply runs. Reliable, fast and the live tracking gives us peace of mind when lives depend on timely delivery.",
    stars: 5,
  },
];

export const Testimonials = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    const step = () => {
      pos += 0.4;
      if (pos >= track.scrollWidth / 2) pos = 0;
      track.scrollLeft = pos;
    };
    const id = setInterval(step, 16);
    track.addEventListener("mouseenter", () => clearInterval(id));
    return () => clearInterval(id);
  }, []);

  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mb-8 text-center space-y-2">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#f97316]">What people say</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Trusted across <span className="text-[#f97316]">Wa & Upper West</span>
        </h2>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 px-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {doubled.map((t, i) => (
          <div
            key={i}
            className="min-w-[280px] max-w-[280px] bg-[#fafaf9] border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 flex-shrink-0"
          >
            <div className="flex gap-0.5 text-yellow-400">
              {"★".repeat(t.stars)}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <div className="w-9 h-9 rounded-full bg-[#f97316] grid place-items-center text-white font-bold text-sm flex-shrink-0">
                {t.initials}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-400">{t.role}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-orange-50 text-[#f97316] rounded font-semibold">{t.biz}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
