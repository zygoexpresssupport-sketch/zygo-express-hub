import { Bike, Building2, MapPin, PackageCheck, Timer, ShieldCheck } from "lucide-react";

const services = [
  { icon: Bike, title: "On-Demand Delivery", desc: "Same-day pickup and drop within the city — perfect for urgent parcels." },
  { icon: Building2, title: "Business & E-commerce", desc: "Scheduled routes and bulk handling for online stores and SMEs." },
  { icon: MapPin, title: "Proudly Serving Wa, Upper West Region", desc: "Coming Soon: Tamale | Bolgatanga" },
  { icon: Timer, title: "Express Same-Day", desc: "Need it now? Our express tier prioritises your shipment end-to-end." },
  { icon: ShieldCheck, title: "Secure Handling", desc: "Insured shipments with proof of delivery and signature capture." },
  { icon: PackageCheck, title: "Returns Management", desc: "Hassle-free reverse logistics for your customers." },
];

export const Services = () => (
  <section id="services" className="py-24 bg-muted/40">
    <div className="container">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
        <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">What we do</div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Built for every <span className="text-gradient">delivery moment</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          From a single envelope to thousands of orders a week — Zygo Express scales with you.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <div
            key={s.title}
            className="group p-7 rounded-2xl bg-card border border-border shadow-card hover:shadow-elegant hover:-translate-y-1 transition-smooth"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-hero grid place-items-center text-primary-foreground mb-5 group-hover:scale-110 transition-bounce">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">{s.title}</h3>
            <p className="text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);