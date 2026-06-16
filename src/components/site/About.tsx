import { TrendingUp, Users, Heart, Globe, ShieldCheck, MapPin, Clock, Smartphone, Zap } from "lucide-react";

const PROMISES = [
  { icon: TrendingUp, title: "Speed",  desc: "Same-day pickups and deliveries across Wa. We move as fast as your business needs." },
  { icon: Heart,      title: "Care",   desc: "Every parcel handled with care. Fragile or urgent — we treat it like our own." },
  { icon: Users,      title: "Trust",  desc: "Legally registered in Wa. Real-time GPS tracking so you always know where your parcel is." },
  { icon: Globe,      title: "Reach",  desc: "From Kpaguri to Jahan, Ssnit to Dobile — we cover Wa and surrounding areas." },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Legally Registered" },
  { icon: MapPin,      label: "Real-time GPS" },
  { icon: Zap,         label: "Same-day Guarantee" },
  { icon: Smartphone,  label: "MTN MoMo" },
  { icon: Clock,       label: "24/7 Service" },
];

export const About = () => (
  <section id="about" className="py-20 bg-[#fafaf9]">
    <div className="container">
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        <div className="space-y-6">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#f97316]">About Zygo</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Driven to deliver.{" "}
            <span className="text-[#f97316]">Powered by purpose.</span>
          </h2>
          <p className="text-gray-500 leading-relaxed">
            At Zygo Express we obsess over the final mile. Every parcel is a promise — and we're built to keep it. From local riders to same-day routes, our team and tech move at the speed your customers expect.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {TRUST_BADGES.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm"
              >
                <b.icon className="h-4 w-4 text-[#f97316]" />
                {b.label}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
            {[{ v:"5x", l:"Faster pickups" }, { v:"500+", l:"Happy clients" }, { v:"#1", l:"Local rated" }].map(s => (
              <div key={s.l}>
                <div className="text-2xl font-extrabold text-[#f97316]">{s.v}</div>
                <div className="text-xs text-gray-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center">
                <p.icon className="h-5 w-5 text-[#f97316]" />
              </div>
              <div className="font-bold text-gray-900">{p.title}</div>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
