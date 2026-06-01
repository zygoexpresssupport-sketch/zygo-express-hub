import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Zap } from "lucide-react";
import hero from "@/assets/hero-delivery.jpg";

export const Hero = () => (
  <section id="top" className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32">
    <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
    <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
          <Zap className="h-4 w-4" />
          Delivering at the speed of business
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
          Your parcel.<br />
          <span className="text-gradient">Delivered faster.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
          Zygo Express is your last-mile partner — on-demand pickups, real-time tracking, and dependable delivery for businesses and individuals.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="hero" size="xl" asChild>
           
          <a href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html">  Get a Quote <ArrowRight />
            </a>
          </Button>
          <Button variant="outlineHero" size="xl" asChild>
            <a href="#track">
              <Package /> Track Parcel
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          {[
            "Now Live in Wa",
            "Serving Pharmacies & Bus Stations",
            "Built for Speed & Trust",
            "Launching Across Upper West",
          ].map((t) => (
            <span
              key={t}
              className="text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="absolute -inset-6 bg-gradient-hero opacity-30 blur-3xl rounded-full" />
        <img
          src={hero}
          alt="Zygo Express courier delivering a parcel at speed"
          width={1600}
          height={1024}
          className="relative rounded-3xl shadow-elegant w-full object-cover aspect-[4/3]"
        />
        <div className="absolute -bottom-6 -left-6 bg-card shadow-card rounded-2xl p-4 flex items-center gap-3 animate-float">
          <div className="h-10 w-10 rounded-full bg-gradient-hero grid place-items-center text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Live</div>
            <div className="text-sm font-bold">Out for delivery</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
