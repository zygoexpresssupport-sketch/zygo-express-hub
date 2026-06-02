import { TrendingUp, Users, Heart, Globe } from "lucide-react";

const promises = [
  {
    icon: TrendingUp,
    title: "Speed",
    desc: "Same-day pickups and deliveries across Wa. We move as fast as your business needs.",
  },
  {
    icon: Heart,
    title: "Care",
    desc: "Every parcel is handled with care. Fragile or urgent — we treat it like our own.",
  },
  {
    icon: Users,
    title: "Trust",
    desc: "Legally registered in Wa. Real-time GPS tracking so you always know where your parcel is.",
  },
  {
    icon: Globe,
    title: "Reach",
    desc: "From Kpaguri to Jahan, Ssnit to Dobile — we cover Wa and surrounding areas.",
  },
];

export const About = () => (
  <section id="about" className="py-24 bg-muted/30">
    <div className="container">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">
            About Zygo
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Driven to deliver.{" "}
            <span className="text-gradient">Powered by purpose.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            At Zygo Express we obsess over the final mile. Every parcel is a promise — and we're built to keep it. From local riders to nationwide routes, our team and tech move at the speed your customers expect.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              { v: "5x", l: "Faster pickups" },
              { v: "500+", l: "Happy clients" },
              { v: "#1", l: "Local rated" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-extrabold text-gradient">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Core promises — all consistent */}
        <div className="grid grid-cols-2 gap-4">
          {promises.map((p) => (
            <div
              key={p.title}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-card h-full"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="font-bold text-base">{p.title}</div>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
