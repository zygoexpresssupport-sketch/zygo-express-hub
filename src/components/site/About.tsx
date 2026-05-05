import { TrendingUp, Users, Award } from "lucide-react";

export const About = () => (
  <section id="about" className="py-24">
    <div className="container grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">About Zygo</div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Driven to deliver. <span className="text-gradient">Powered by purpose.</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          At Zygo Express we obsess over the final mile. Every parcel is a promise — and we're built to keep it. From local riders to nationwide routes, our team and tech move at the speed your customers expect.
        </p>
        <div className="grid grid-cols-3 gap-6 pt-4">
          {[
            { icon: TrendingUp, v: "5x", l: "Faster pickups" },
            { icon: Users, v: "500+", l: "Happy clients" },
            { icon: Award, v: "#1", l: "Local rated" },
          ].map((s) => (
            <div key={s.l} className="space-y-2">
              <s.icon className="h-6 w-6 text-primary" />
              <div className="text-2xl font-extrabold">{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-2 gap-4">
          {["Speed", "Trust", "Care", "Reach"].map((w, i) => (
            <div
              key={w}
              className={`p-8 rounded-2xl ${i % 2 === 0 ? "bg-gradient-hero text-primary-foreground shadow-glow" : "bg-card border border-border shadow-card"} ${i === 1 ? "translate-y-6" : ""} ${i === 2 ? "-translate-y-6" : ""}`}
            >
              <div className="text-3xl font-extrabold">{w}</div>
              <div className="text-sm opacity-80 mt-2">A core promise</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);