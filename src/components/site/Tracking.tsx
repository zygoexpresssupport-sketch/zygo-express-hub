import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Truck, CheckCircle2, Package, Clock, RefreshCw, BadgeCheck, Smartphone, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const STATUS_FLOW = ["pending","confirmed","picked_up","in_transit","out_for_delivery","delivered"] as const;
type StatusType = typeof STATUS_FLOW[number];

const STAGE_META: Record<StatusType,{label:string;icon:any}> = {
  pending:          {label:"Pending",          icon:Clock},
  confirmed:        {label:"Confirmed",        icon:Clock},
  picked_up:        {label:"Picked up",        icon:Package},
  in_transit:       {label:"In transit",       icon:Truck},
  out_for_delivery: {label:"Out for delivery", icon:MapPin},
  delivered:        {label:"Delivered",        icon:CheckCircle2},
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
  delivery_photo?:string|null; delivery_notes?:string|null;
  delivery_lat?:number|null; delivery_lng?:number|null;
};

const HISTORY_KEY = "zygo_track_history";

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(code: string) {
  const h = [code, ...getHistory().filter(c => c !== code)].slice(0, 3);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

export const Tracking = () => {
  const [id, setId]           = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<TrackResult|null>(null);
  const [rating, setRating]   = useState(0);
  const [momoRef, setMomoRef] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const channelRef            = useRef<any>(null);

  useEffect(() => {
    setHistory(getHistory());
    // Pre-fill from URL param
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) { setId(code); doTrack(code); }
  }, []);

  useEffect(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    if (!result) return;
    const ch = supabase.channel(`track-${result.tracking_code}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"quote_requests",
        filter:`tracking_code=eq.${result.tracking_code}`},
        p => setResult(prev => prev ? {...prev,...(p.new as TrackResult)} : prev))
      .subscribe();
    channelRef.current = ch;
  }, [result?.tracking_code]);

  const doTrack = async (code: string) => {
    const c = code.trim().toUpperCase();
    if (!c) { toast.error("Please enter a tracking ID"); return; }
    setLoading(true);
    try {
      const { data: rpc } = await supabase.rpc("lookup_tracking", { _code: c });
      if (rpc && (rpc as any[]).length > 0) {
        setResult((rpc as any[])[0]);
        saveHistory(c);
        setHistory(getHistory());
        setLoading(false); return;
      }
      const { data, error } = await supabase.from("quote_requests").select("*").eq("tracking_code", c).single();
      setLoading(false);
      if (error || !data) { toast.error("No shipment found for that tracking ID."); return; }
      setResult(data as TrackResult);
      saveHistory(c);
      setHistory(getHistory());
    } catch { setLoading(false); toast.error("Lookup failed. Try again."); }
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); doTrack(id); };

  const shareTracking = async () => {
    const url = `${window.location.origin}${window.location.pathname}?code=${result?.tracking_code}`;
    if (navigator.share) {
      await navigator.share({ title: "Track my Zygo Express parcel", url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Tracking link copied!");
    }
  };

  const submitRating = async (stars: number) => {
    if (!result) return;
    setRating(stars);
    await supabase.from("quote_requests").update({ rider_rating: stars }).eq("tracking_code", result.tracking_code);
    toast.success(`Thanks for rating ${stars}⭐`);
  };

  const activeIdx = result ? (() => { const i = STATUS_FLOW.indexOf(result.status as StatusType); return i === -1 ? 0 : i; })() : 0;
  const currency = result?.currency ?? "GHS";

  return (
    <section id="track" className="py-20 bg-white">
      <div className="container max-w-3xl">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#f97316]">Track parcel</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Where's my <span className="text-[#f97316]">package?</span>
          </h2>
          <p className="text-gray-500 text-sm">Enter your tracking ID for live delivery status</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 p-3 bg-[#fafaf9] border border-gray-200 rounded-2xl shadow-sm mb-4">
          <input
            value={id}
            onChange={e => setId(e.target.value.toUpperCase())}
            placeholder="Enter tracking ID e.g. ZGX-A1B2C3"
            maxLength={24}
            className="flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder-gray-400 font-medium"
          />
          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 text-sm">
            <Search className="h-4 w-4" /> {loading ? "Searching…" : "Track"}
          </button>
        </form>

        {/* Recent history */}
        {history.length > 0 && !result && (
          <div className="mb-6">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Recent Searches</div>
            <div className="flex gap-2 flex-wrap">
              {history.map(c => (
                <button key={c} onClick={() => { setId(c); doTrack(c); }}
                  className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-[#f97316] text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-[#fafaf9] border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Tracking ID</div>
                <div className="font-bold text-lg text-gray-900">{result.tracking_code}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#f97316] text-xs font-bold uppercase">
                  {STAGE_META[result.status as StatusType]?.label ?? result.status}
                </span>
                <button onClick={shareTracking} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="grid grid-cols-6 gap-1 relative">
              <div className="absolute top-5 left-[8%] right-[8%] h-0.5 bg-gray-200 -z-0"/>
              <div className="absolute top-5 left-[8%] h-0.5 bg-[#f97316] -z-0 transition-all duration-700"
                style={{width:`${(activeIdx/(STATUS_FLOW.length-1))*84}%`}}/>
              {STATUS_FLOW.map((s,i) => {
                const meta = STAGE_META[s]; const done = i <= activeIdx; const Icon = meta.icon;
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-1.5 text-center">
                    <div className={`h-10 w-10 rounded-full grid place-items-center transition-all ${done ? "bg-[#f97316] text-white shadow-md shadow-orange-200" : "bg-white border-2 border-gray-200 text-gray-400"}`}>
                      <Icon className="h-4 w-4"/>
                    </div>
                    <div className={`text-[9px] font-semibold leading-tight ${done ? "text-gray-800" : "text-gray-400"}`}>{meta.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Route */}
            <div className="grid sm:grid-cols-2 gap-4 text-sm bg-white border border-gray-100 rounded-xl p-4">
              <div><div className="text-xs text-gray-400 mb-0.5">Pickup</div><div className="font-medium text-gray-800">{result.pickup}</div></div>
              <div><div className="text-xs text-gray-400 mb-0.5">Drop-off</div><div className="font-medium text-gray-800">{result.dropoff}</div></div>
            </div>

            {/* Live GPS */}
            {result.rider_lat && result.rider_lng && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Rider location updating live
              </div>
            )}

            {/* Payment */}
            {result.price && Number(result.price) > 0 && (
              result.paid_at ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                  <BadgeCheck className="h-5 w-5"/> Payment confirmed · {currency} {Number(result.price).toFixed(2)}
                </div>
              ) : (
                <div className="bg-white border border-orange-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">Amount due</div>
                      <div className="text-2xl font-extrabold text-gray-900">{currency} {Number(result.price).toFixed(2)}</div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold">
                      <Smartphone className="h-3.5 w-3.5"/> MTN MoMo
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Send to <strong className="text-gray-900">0240393582</strong> (Zygo Express) via MTN *170#
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1.5">MoMo Reference</div>
                    <input
                      value={momoRef || result.tracking_code}
                      onChange={e => setMomoRef(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-gray-900 outline-none focus:border-[#f97316] bg-[#fafaf9]"
                      readOnly
                      onClick={e => (e.target as HTMLInputElement).select()}
                    />
                    <p className="text-xs text-gray-400 mt-1">Tap to select · Use as your MoMo reference</p>
                  </div>
                </div>
              )
            )}

            {/* Proof of delivery photo */}
            {result.delivery_photo && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Proof of Delivery</div>
                <img src={result.delivery_photo} alt="Delivery proof" className="w-full rounded-xl border border-gray-200 object-cover max-h-48" />
                {result.delivery_notes && <p className="text-xs text-gray-500 italic">"{result.delivery_notes}"</p>}
              </div>
            )}

            {/* Star rating prompt on delivered */}
            {result.status === "delivered" && !rating && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center space-y-3">
                <div className="font-bold text-gray-800 text-sm">How was your delivery?</div>
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => submitRating(s)}
                      className="text-3xl hover:scale-110 transition-transform text-gray-300 hover:text-yellow-400">
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}
            {rating > 0 && (
              <div className="text-center text-sm font-medium text-green-600">
                Thanks for rating! {"⭐".repeat(rating)}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
