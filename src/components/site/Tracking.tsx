import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Truck, CheckCircle2, Package, Clock, RefreshCw, BadgeCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const STATUS_FLOW = ["pending","confirmed","picked_up","in_transit","out_for_delivery","delivered"] as const;
type StatusType = typeof STATUS_FLOW[number];

const STAGE_META: Record<StatusType,{label:string;icon:any}> = {
  pending:          {label:"Pending",         icon:Clock},
  confirmed:        {label:"Confirmed",       icon:Clock},
  picked_up:        {label:"Picked up",       icon:Package},
  in_transit:       {label:"In transit",      icon:Truck},
  out_for_delivery: {label:"Out for delivery",icon:MapPin},
  delivered:        {label:"Delivered",       icon:CheckCircle2},
};

type TrackResult = {
  tracking_code:string; status:string; pickup:string; dropoff:string;
  created_at:string; confirmed_at:string|null;
  pickup_lat:number|null; pickup_lng:number|null;
  dropoff_lat:number|null; dropoff_lng:number|null;
  rider_lat:number|null; rider_lng:number|null;
  rider_updated_at:string|null; price:number|null;
  paid_at:string|null; currency?:string|null;
  name?:string|null; phone?:string|null;
};

export const Tracking = () => {
  const [id, setId]         = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult|null>(null);
  const channelRef          = useRef<any>(null);

  useEffect(() => {
    return () => { if(channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  useEffect(() => {
    if(channelRef.current){ supabase.removeChannel(channelRef.current); channelRef.current=null; }
    if(!result) return;
    const ch = supabase.channel(`track-${result.tracking_code}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"quote_requests",
        filter:`tracking_code=eq.${result.tracking_code}`},
        (payload)=>setResult(prev=>prev?{...prev,...(payload.new as TrackResult)}:prev))
      .subscribe();
    channelRef.current = ch;
  }, [result?.tracking_code]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = id.trim().toUpperCase();
    if(!code){ toast.error("Please enter a tracking ID"); return; }
    setLoading(true);
    try {
      // Try RPC first
      const { data: rpcData, error: rpcErr } = await supabase
        .rpc("lookup_tracking", { _code: code });
      
      if(!rpcErr && rpcData && (rpcData as any[]).length > 0){
        setResult((rpcData as any[])[0]);
        setLoading(false);
        return;
      }

      // Fallback: direct query
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("tracking_code", code)
        .single();

      setLoading(false);
      if(error || !data){ toast.error("No shipment found for that code."); return; }
      setResult(data as TrackResult);
    } catch {
      setLoading(false);
      toast.error("Lookup failed. Please try again.");
    }
  };

  const activeIdx = result ? (() => {
    const i = STATUS_FLOW.indexOf(result.status as StatusType);
    return i === -1 ? 0 : i;
  })() : 0;

  const currency = result?.currency ?? "GHS";

  const riderLastSeen = result?.rider_updated_at
    ? new Date(result.rider_updated_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
    : null;

  return (
    <section id="track" className="py-24">
      <div className="container max-w-4xl">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">Track parcel</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Where's my <span className="text-gradient">package?</span>
          </h2>
          <p className="text-muted-foreground">Enter your tracking ID to see live delivery status</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 p-3 bg-card rounded-2xl shadow-card border border-border">
          <Input
            value={id}
            onChange={e=>setId(e.target.value.toUpperCase())}
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
                {STAGE_META[result.status as StatusType]?.label ?? result.status}
              </span>
            </div>

            {/* Progress */}
            <div className="grid grid-cols-6 gap-2 relative">
              <div className="absolute top-5 left-[8%] right-[8%] h-0.5 bg-border -z-0"/>
              <div className="absolute top-5 left-[8%] h-0.5 bg-gradient-hero -z-0 transition-smooth"
                style={{width:`${(activeIdx/(STATUS_FLOW.length-1))*84}%`}}/>
              {STATUS_FLOW.map((s,i)=>{
                const meta=STAGE_META[s]; const done=i<=activeIdx; const Icon=meta.icon;
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2 text-center">
                    <div className={`h-10 w-10 rounded-full grid place-items-center transition-bounce ${done?"bg-gradient-hero text-primary-foreground shadow-glow":"bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5"/>
                    </div>
                    <div className={`text-[10px] font-semibold ${done?"text-foreground":"text-muted-foreground"}`}>{meta.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Route */}
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><div className="text-xs text-muted-foreground">Pickup</div><div className="font-medium">{result.pickup}</div></div>
              <div><div className="text-xs text-muted-foreground">Drop-off</div><div className="font-medium">{result.dropoff}</div></div>
            </div>

            {/* Live rider */}
            {result.rider_lat && result.rider_lng && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5 animate-spin-slow text-primary"/>
                <span>Live rider location active{riderLastSeen&&<> · Last updated <strong>{riderLastSeen}</strong></>}</span>
              </div>
            )}

            {/* Payment */}
            {result.price && Number(result.price)>0 && (
              result.paid_at ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 text-green-600 text-sm font-semibold">
                  <BadgeCheck className="h-5 w-5"/> Payment confirmed · {currency} {Number(result.price).toFixed(2)}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Amount due</div>
                      <div className="text-2xl font-extrabold">{currency} {Number(result.price).toFixed(2)}</div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                      <Smartphone className="h-4 w-4"/> MTN MoMo
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Send payment to <strong>0240393582</strong> (Zygo Express) via MTN MoMo *170#
                  </div>
                  <div className="text-xs text-muted-foreground">Use your tracking ID <strong>{result.tracking_code}</strong> as reference</div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};
