import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Zap } from "lucide-react";
import hero from "@/assets/hero-delivery.jpg";

export const Hero = () => (
  <section id="top" className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
    <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
    <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest">
          <Zap className="h-4 w-4" />
          Delivering at the speed of business
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
          Your parcel.<br />
          <span className="text-gradient">Delivered faster.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
          Zygo Express is your last-mile partner — on-demand pickups, real-time tracking, and same-day delivery across Wa & Upper West Ghana.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="hero" size="xl" asChild>
            <a href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html">
              Get a Quote <ArrowRight />
            </a>
          </Button>
          <Button variant="outlineHero" size="xl" asChild>
            <a href="#track">
              <Package /> Track Parcel
            </a>
          </Button>
        </div>

        {/* Live stats bar */}
        <div className="flex flex-wrap gap-6 pt-2">
          {[
            { v: "120+", l: "Deliveries made" },
            { v: "4.9★", l: "Customer rating" },
            { v: "Live", l: "in Wa, UW Ghana" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-2xl md:text-3xl font-extrabold text-gradient">{s.v}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{s.l}</div>
            </div>
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
        <div className="absolute -bottom-6 -left-6 bg-card shadow-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-hero grid place-items-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Live</div>
            <div className="text-sm font-bold">Rider en route 📍</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
