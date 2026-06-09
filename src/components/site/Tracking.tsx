import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type OrderResult = {
  tracking_code: string;
  status: string;
  pickup: string;
  dropoff: string;
  created_at: string;
  name: string | null;
  customer_name: string | null;
};

const STATUS_STEPS = [
  { key: "pending",          label: "Received",    icon: Clock        },
  { key: "confirmed",        label: "Confirmed",   icon: CheckCircle2 },
  { key: "picked_up",        label: "Picked Up",   icon: Package      },
  { key: "in_transit",       label: "In Transit",  icon: Truck        },
  { key: "out_for_delivery", label: "On the Way",  icon: Truck        },
  { key: "delivered",        label: "Delivered",   icon: CheckCircle2 },
];

const STATUS_COLOR: Record<string, string> = {
  pending:          "text-gray-500",
  confirmed:        "text-orange-500",
  picked_up:        "text-blue-500",
  in_transit:       "text-blue-600",
  out_for_delivery: "text-purple-500",
  delivered:        "text-green-600",
  cancelled:        "text-red-500",
};

export const Tracking = () => {
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<OrderResult | null>(null);
  const [searched, setSearched] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Please enter a tracking code.");
      return;
    }
    if (!trimmed.startsWith("ZGX-")) {
      toast.error("Tracking codes start with ZGX-");
      return;
    }

    setLoading(true);
    setResult(null);
    setSearched(false);

    try {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("tracking_code, status, pickup, dropoff, created_at, name, customer_name")
        .ilike("tracking_code", trimmed)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setSearched(true);

      if (!data) {
        toast.error("No shipment found for that code.");
      } else {
        setResult(data as OrderResult);
      }
    } catch (err: any) {
      toast.error("Lookup failed. Please try again.");
    }

    setLoading(false);
  };

  const activeIdx = result
    ? STATUS_STEPS.findIndex(s => s.key === result.status)
    : -1;

  const isCancelled = result?.status === "cancelled";

  return (
    <section id="track" className="py-24">
      <div className="container max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">
            Track parcel
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Where's my <span className="text-gradient">package?</span>
          </h2>
          <p className="text-muted-foreground">
            Enter your tracking code to see your delivery status
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col sm:flex-row gap-3 p-3 bg-card rounded-2xl shadow-card border border-border"
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter tracking ID e.g. ZGX-A1B2C3"
            maxLength={12}
            className="h-14 text-base border-0 focus-visible:ring-0 bg-transparent"
          />
          <Button type="submit" variant="hero" size="xl" disabled={loading}>
            <Search /> {loading ? "Searching…" : "Track"}
          </Button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-8 bg-card border border-border rounded-2xl p-6 shadow-card space-y-6 animate-fade-up">

            {/* Tracking code + status */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Tracking ID</div>
                <div className="font-bold text-lg font-mono">{result.tracking_code}</div>
              </div>
              <span className={`text-sm font-bold uppercase ${STATUS_COLOR[result.status] || "text-gray-500"}`}>
                {isCancelled ? "❌ Cancelled" : result.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Progress steps */}
            {!isCancelled && (
              <div className="space-y-3">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= activeIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full grid place-items-center flex-shrink-0 ${
                        done ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`text-sm font-medium ${
                        done ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </span>
                      {i === activeIdx && (
                        <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cancelled message */}
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

            {/* Pickup / Dropoff */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground mb-1">📍 Pickup</div>
                <div className="font-medium text-sm">{result.pickup}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">🏁 Drop-off</div>
                <div className="font-medium text-sm">{result.dropoff}</div>
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-muted-foreground">
              Booked: {new Date(result.created_at).toLocaleString()}
            </div>

            {/* Help */}
            <div className="bg-muted/30 rounded-xl p-4 text-sm text-center">
              Need help? WhatsApp us at{" "}
              <a
                href="https://wa.me/233202858011"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold"
              >
                0202858011
              </a>
            </div>

          </div>
        )}

        {/* No result message */}
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