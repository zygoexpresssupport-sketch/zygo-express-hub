import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Truck,
  CheckCircle2,
  Package,
  Clock,
  Smartphone,
  BadgeCheck,
  MapPin,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = z
  .string()
  .trim()
  .min(4, "Tracking ID too short")
  .max(24, "Tracking ID too long");

// ─── Status flow ──────────────────────────────────────────────────────────────
const STATUS_FLOW = [
  "pending",
  "confirmed",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;

type StatusType = (typeof STATUS_FLOW)[number];

const STAGE_META: Record<StatusType, { label: string; icon: any }> = {
  pending:          { label: "Pending",          icon: Clock        },
  confirmed:        { label: "Confirmed",        icon: CheckCircle2 },
  picked_up:        { label: "Picked Up",        icon: Package      },
  in_transit:       { label: "In Transit",       icon: Truck        },
  out_for_delivery: { label: "Out for Delivery", icon: MapPin       },
  delivered:        { label: "Delivered",        icon: CheckCircle2 },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type TrackResult = {
  tracking_code: string;
  status: string;
  pickup: string;
  dropoff: string;
  created_at: string;
  price: number | null;
  paid_at: string | null;
  currency?: string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Tracking = () => {
  const [id, setId]           = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<TrackResult | null>(null);
  const [searched, setSearched] = useState(false);

  // ─── Lookup ───────────────────────────────────────────────────────────────
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(id);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    setResult(null);
    setSearched(false);

    try {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("tracking_code, status, pickup, dropoff, created_at, price, paid_at, currency")
        .ilike("tracking_code", parsed.data.toUpperCase())
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setSearched(true);

      if (!data) {
        toast.error("No shipment found for that code.");
      } else {
        setResult(data as TrackResult);
      }
    } catch (err: any) {
      toast.error("Lookup failed. Please try again.");
    }

    setLoading(false);
  };

  // ─── Active step ──────────────────────────────────────────────────────────
  const activeIdx = result
    ? (() => {
        const idx = STATUS_FLOW.indexOf(result.status as StatusType);
        return idx === -1 ? 0 : idx;
      })()
    : 0;

  const currency = result?.currency ?? "GHS";
  const isCancelled = result?.status === "cancelled";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section id="track" className="py-24">
      <div className="container max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">
            Track parcel
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Where's my{" "}
            <span className="text-gradient">package?</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter your tracking code to see your delivery status
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col sm:flex-row gap-3 p-3 bg-card rounded-2xl shadow-card border border-border"
        >
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

        {/* Result card */}
        {result && (
          <div className="mt-10 p-6 md:p-8 rounded-2xl bg-card border border-border shadow-card animate-fade-up space-y-6">

            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Tracking ID</div>
                <div className="font-bold text-lg font-mono">{result.tracking_code}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                {isCancelled ? "Cancelled" : (STAGE_META[result.status as StatusType]?.label ?? result.status)}
              </span>
            </div>

            {/* Cancelled state */}
            {isCancelled && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-red-600">Delivery Cancelled</div>
                  <div className="text-sm text-muted-foreground">
                    Please contact us on WhatsApp for assistance.
                  </div>
                </div>
              </div>
            )}

            {/* Status progress */}
            {!isCancelled && (
              <div className="grid grid-cols-6 gap-2 relative">
                {/* Background track */}
                <div className="absolute top-5 left-[8%] right-[8%] h-0.5 bg-border -z-0" />
                {/* Active fill */}
                <div
                  className="absolute top-5 left-[8%] h-0.5 bg-gradient-hero -z-0 transition-smooth"
                  style={{
                    width: `${(activeIdx / (STATUS_FLOW.length - 1)) * 84}%`,
                  }}
                />
                {STATUS_FLOW.map((s, i) => {
                  const meta = STAGE_META[s];
                  const done = i <= activeIdx;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={s}
                      className="relative z-10 flex flex-col items-center gap-2 text-center"
                    >
                      <div
                        className={`h-10 w-10 rounded-full grid place-items-center transition-bounce ${
                          done
                            ? "bg-gradient-hero text-primary-foreground shadow-glow"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          done ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {meta.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pickup / Dropoff */}
            <div className="grid sm:grid-cols-2 gap-4 text-sm border-t border-border pt-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">📍 Pickup</div>
                <div className="font-medium">{result.pickup}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">🏁 Drop-off</div>
                <div className="font-medium">{result.dropoff}</div>
              </div>
            </div>

            {/* Payment section */}
            {result.price && Number(result.price) > 0 && (
              <div className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Amount due</div>
                    <div className="text-2xl font-extrabold">
                      {currency} {Number(result.price).toFixed(2)}
                    </div>
                  </div>
                  {result.paid_at ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/15 text-green-600 text-xs font-bold uppercase">
                      <BadgeCheck className="h-4 w-4" /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                      <Smartphone className="h-4 w-4" /> Mobile Money
                    </span>
                  )}
                </div>

                {/* MoMo payment instructions */}
                {!result.paid_at && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-background border border-border p-3">
  <div className="text-xs text-muted-foreground mb-1">
    Send Mobile Money to:
  </div>
  <div className="flex items-center justify-between gap-3">
    <div>
      <div className="font-extrabold text-2xl text-primary tracking-wider">
        0240393582
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        Account name: Zygo Express · MTN MoMo
      </div>
    </div>
    <button
      onClick={() => {
        navigator.clipboard.writeText("0240393582");
        toast.success("Number copied!");
      }}
      className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors text-xs font-semibold"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
      Copy
    </button>
  </div>
</div>
                    <p className="text-xs text-muted-foreground">
                      After payment, send your reference number to us on WhatsApp for confirmation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Booked date */}
            <div className="text-xs text-muted-foreground">
              Booked: {new Date(result.created_at).toLocaleString()}
            </div>

            {/* Help */}
            <div className="bg-muted/30 rounded-xl p-4 text-sm text-center space-y-1">
              <div className="font-semibold">Need help?</div>
              <div className="text-muted-foreground text-xs">
                WhatsApp us and we'll sort it out immediately
              </div>
              <a
                href="https://wa.me/233202858011"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold"
              >
                💬 WhatsApp Us
              </a>
            </div>

          </div>
        )}

        {/* No result */}
        {searched && !result && (
          <div className="mt-8 text-center p-8 bg-card border border-border rounded-2xl">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <div className="font-semibold">No shipment found</div>
            <div className="text-sm text-muted-foreground mt-1">
              Check your tracking code and try again
            </div>
          </div>
        )}

      </div>
    </section>
  );
};