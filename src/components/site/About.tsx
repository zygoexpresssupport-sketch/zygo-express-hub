import { ShieldCheck, MapPin, Clock, Smartphone, Zap } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";

const GALLERY = [
  { src: g1, alt: "Zygo rider handing a parcel to a smiling customer in Wa" },
  { src: g3, alt: "Zygo delivery rider speeding through the market at golden hour" },
  { src: g2, alt: "Parcel being sealed with orange Zygo tape" },
  { src: g5, alt: "Happy customer receiving her parcel at the doorstep" },
  { src: g4, alt: "Organized stack of parcels ready for dispatch" },
  { src: g6, alt: "Zygo delivery tracking on a smartphone" },
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
      <div className="grid lg:grid-cols-2 gap-14 items-start">
        <div className="space-y-6 lg:sticky lg:top-24">
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
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {GALLERY.map((img, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-2xl bg-gray-100 shadow-sm group ${
                i === 0 || i === 3 ? "row-span-2 aspect-[3/4]" : "aspect-square"
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                width={1024}
                height={1024}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
