import { ArrowRight, Zap, Building2, Heart, RotateCcw } from "lucide-react";

const SERVICES = [
  {
    icon: Zap,
    title: "Express Delivery",
    desc: "Same-day door-to-door delivery across Wa. Fastest pickup in town.",
    price: "From GHS 13",
    color: "bg-orange-50 text-[#f97316]",
  },
  {
    icon: Building2,
    title: "Business & E-commerce",
    desc: "Bulk delivery solutions for shops, pharmacies and online sellers.",
    price: "From GHS 13",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Heart,
    title: "Medical Delivery",
    desc: "Fast, safe delivery of prescriptions and medical supplies across Wa.",
    price: "From GHS 13",
    color: "bg-red-50 text-red-500",
  },
  {
    icon: RotateCcw,
    title: "Returns & Pickups",
    desc: "Easy return pickups from your door. We handle the logistics.",
    price: "From GHS 13",
    color: "bg-green-50 text-green-600",
  },
];

const BOOK_URL = "https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html";

export const Services = () => (
  <section id="services" className="py-20 bg-[#fafaf9]">
    <div className="container">
      <div className="text-center mb-10 space-y-2">
        <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#f97316]">What we do</div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Delivery for <span className="text-[#f97316]">every need</span>
        </h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">From urgent documents to bulk business orders — we've got you covered.</p>
      </div>

      {/* Horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible scrollbar-hide">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="min-w-[260px] md:min-w-0 snap-start bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`h-11 w-11 rounded-xl grid place-items-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-[#f97316] font-bold text-sm">{s.price}</span>
              <a
                href={BOOK_URL}
                className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-[#f97316] font-bold text-xs px-3 py-2 rounded-lg transition-colors"
              >
                Book Now <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
