import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Truck, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";

const schema = z.string().trim().regex(/^[A-Za-z0-9-]{4,24}$/, "Tracking ID should be 4–24 letters, numbers or dashes");

const stages = [
  { icon: Package, label: "Picked up", time: "09:14" },
  { icon: Truck, label: "In transit", time: "10:42" },
  { icon: MapPin, label: "Out for delivery", time: "12:08" },
  { icon: CheckCircle2, label: "Delivered", time: "—" },
];

export const Tracking = () => {
  const [id, setId] = useState("");
  const [active, setActive] = useState<number | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(id);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    // Demo — pick a stage based on the ID hash
    const stage = Math.abs([...parsed.data].reduce((a, c) => a + c.charCodeAt(0), 0)) % 3;
    setActive(stage);
    toast.success(`Found shipment ${parsed.data}`);
  };

  return (
    <section id="track" className="py-24">
      <div className="container max-w-4xl">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">Track parcel</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Where's my <span className="text-gradient">package?</span></h2>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 p-3 bg-card rounded-2xl shadow-card border border-border">
          <Input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter tracking ID e.g. ZGX-12345"
            maxLength={24}
            className="h-14 text-base border-0 focus-visible:ring-0 bg-transparent"
          />
          <Button type="submit" variant="hero" size="xl">
            <Search /> Track
          </Button>
        </form>

        {active !== null && (
          <div className="mt-10 p-6 md:p-8 rounded-2xl bg-card border border-border shadow-card animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-muted-foreground">Tracking ID</div>
                <div className="font-bold text-lg">{id}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Active</span>
            </div>
            <div className="grid grid-cols-4 gap-2 relative">
              <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-border -z-0" />
              <div
                className="absolute top-5 left-[12.5%] h-0.5 bg-gradient-hero -z-0 transition-smooth"
                style={{ width: `${(active / 3) * 75}%` }}
              />
              {stages.map((s, i) => {
                const done = i <= active;
                return (
                  <div key={s.label} className="relative z-10 flex flex-col items-center gap-2 text-center">
                    <div className={`h-10 w-10 rounded-full grid place-items-center transition-bounce ${done ? "bg-gradient-hero text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className={`text-xs font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">{s.time}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};