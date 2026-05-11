import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Truck, CheckCircle2, Package, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RouteMap } from "./RouteMap";

const schema = z.string().trim().regex(/^[A-Za-z0-9-]{4,24}$/, "Tracking ID should be 4–24 letters, numbers or dashes");

const STATUS_FLOW = ["confirmed", "picked_up", "in_transit", "out_for_delivery", "delivered"] as const;
const STAGE_META: Record<string, { label: string; icon: any }> = {
  confirmed: { label: "Confirmed", icon: Clock },
  picked_up: { label: "Picked up", icon: Package },
  in_transit: { label: "In transit", icon: Truck },
  out_for_delivery: { label: "Out for delivery", icon: MapPin },
  delivered: { label: "Delivered", icon: CheckCircle2 },
};

type TrackResult = {
  tracking_code: string;
  status: string;
  pickup: string;
  dropoff: string;
  created_at: string;
  confirmed_at: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
};

export const Tracking = () => {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(id);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { data, error } = await supabase.rpc("lookup_tracking", { _code: parsed.data.toUpperCase() });
    setLoading(false);
    if (error) return toast.error("Lookup failed");
    const row = (data as any)?.[0];
    if (!row) {
      setResult(null);
      return toast.error("No shipment found for that code");
    }
    setResult(row);
  };

  const activeIdx = result ? Math.max(0, STATUS_FLOW.indexOf(result.status as any)) : 0;

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
            onChange={(e) => setId(e.target.value.toUpperCase())}
            placeholder="Enter tracking ID e.g. ZGX-A1B2C3"
            maxLength={24}
            className="h-14 text-base border-0 focus-visible:ring-0 bg-transparent"
          />
          <Button type="submit" variant="hero" size="xl" disabled={loading}>
            <Search /> {loading ? "Searching…" : "Track"}
          </Button>
        </form>

        {result && (
          <div className="mt-10 p-6 md:p-8 rounded-2xl bg-card border border-border shadow-card animate-fade-up space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Tracking ID</div>
                <div className="font-bold text-lg">{result.tracking_code}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                {STAGE_META[result.status]?.label ?? result.status}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 relative">
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-border -z-0" />
              <div
                className="absolute top-5 left-[10%] h-0.5 bg-gradient-hero -z-0 transition-smooth"
                style={{ width: `${(activeIdx / (STATUS_FLOW.length - 1)) * 80}%` }}
              />
              {STATUS_FLOW.map((s, i) => {
                const meta = STAGE_META[s];
                const done = i <= activeIdx && result.status !== "pending";
                const Icon = meta.icon;
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2 text-center">
                    <div className={`h-10 w-10 rounded-full grid place-items-center transition-bounce ${done ? "bg-gradient-hero text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={`text-[11px] font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{meta.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><div className="text-xs text-muted-foreground">Pickup</div><div className="font-medium">{result.pickup}</div></div>
              <div><div className="text-xs text-muted-foreground">Drop-off</div><div className="font-medium">{result.dropoff}</div></div>
            </div>

            {(result.pickup_lat || result.dropoff_lat) && (
              <RouteMap
                pickup={result.pickup_lat && result.pickup_lng ? { lat: result.pickup_lat, lng: result.pickup_lng, label: result.pickup } : null}
                dropoff={result.dropoff_lat && result.dropoff_lng ? { lat: result.dropoff_lat, lng: result.dropoff_lng, label: result.dropoff } : null}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};
