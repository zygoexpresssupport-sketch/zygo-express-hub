import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Shield, Star } from "lucide-react";

export const Quote = () => (
  <section id="quote" className="py-20 bg-muted/30">
    <div className="container">
      <div className="max-w-3xl mx-auto text-center space-y-6">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest">
          <Star className="h-4 w-4" />
          Book a Delivery
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Ready to send a parcel?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Get an instant price, pay via MoMo, and your rider picks up within the hour. Same-day delivery across Wa & Upper West Ghana.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 py-4">
          {[
            { icon: Clock, label: "Same-day delivery" },
            { icon: Shield, label: "Safe & insured" },
            { icon: Star, label: "4.9★ rated service" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button size="xl" variant="hero" asChild>
          <a
            href="https://zygoexpresssupport-sketch.github.io/zygo-express-hub/public/book.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a Delivery Now <ArrowRight className="h-5 w-5" />
          </a>
        </Button>

        <p className="text-xs text-muted-foreground">
          Pay via MTN MoMo · No app download needed · Instant confirmation
        </p>

      </div>
    </div>
  </section>
);