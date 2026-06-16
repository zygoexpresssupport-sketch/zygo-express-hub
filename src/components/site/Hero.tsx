import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Zap, Clock, Star } from "lucide-react";
import hero from "@/assets/hero-delivery.jpg";

export const Hero = () => (
  <section id="top" className="relative overflow-hidden bg-[#fafaf9]">
    {/* Urgency bar */}
    <div className="w-full bg-orange-50 border-b border-orange-100 py-2 px-4 text-center text-sm font-medium text-orange-700 flex items-center justify-center gap-2 flex-wrap">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
      Riders active now · 28min avg pickup · 24/7 service
    </div>

    <div className="container relative grid lg:grid-cols-2 gap-10 items-center pt-12 pb-16 lg:pt-20 lg:pb-24">
      <div className="space-y-6 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-widest">
          <Zap className="h-3.5 w-3.5" /> Wa's #1 Delivery Service
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-gray-900">
          Your parcel.<br />
          <span className="text-[#f97316]">Delivered faster.</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
          On-demand pickups, live GPS tracking, and same-day delivery across Wa & Upper West Ghana. From just <strong className="text-gray-800">GHS 13</strong>.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html"
            className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-bold text-base px-6 py-4 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            Book a Delivery <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#track"
            className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-800 font-bold text-base px-6 py-4 rounded-xl transition-all"
          >
            <Package className="h-4 w-4" /> Track Parcel
          </a>
        </div>

        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className="text-[#f97316]">⚡</span>
          Average pickup in 28 minutes · No hidden charges
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
          {[
            { v: "120+", l: "Deliveries made" },
            { v: "4.9★", l: "Customer rating" },
            { v: "GHS 13", l: "Starting price" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-2xl font-extrabold text-[#f97316]">{s.v}</div>
              <div className="text-xs text-gray-500">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative animate-fade-up hidden lg:block" style={{ animationDelay: "0.2s" }}>
        <div className="absolute -inset-8 bg-orange-50 rounded-[40px] -z-10" />
        <img
          src={hero}
          alt="Zygo Express delivery rider"
          className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
        />
        <div className="absolute -bottom-4 -left-4 bg-white shadow-xl rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
          <div className="h-10 w-10 rounded-full bg-orange-50 grid place-items-center">
            <Package className="h-5 w-5 text-[#f97316]" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Live Update</div>
            <div className="text-sm font-bold text-gray-800">Rider en route 📍</div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 bg-white shadow-xl rounded-2xl p-3 flex items-center gap-2 border border-gray-100">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-gray-800">4.9 Rating</span>
        </div>
      </div>
    </div>
  </section>
);
