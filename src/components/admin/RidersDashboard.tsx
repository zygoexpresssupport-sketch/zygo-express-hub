import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bike, Power, PowerOff, Pencil, Check, X } from "lucide-react";

type RiderStat = {
  rider_id: string;
  slot: number;
  name: string;
  is_active: boolean;
  signed_in_at: string | null;
  deliveries: number;
  revenue: number;
  in_progress: number;
};

export const RidersDashboard = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [day, setDay] = useState(today);
  const [rows, setRows] = useState<RiderStat[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; phone: string }>({ name: "", phone: "" });

  const load = async () => {
    const { data, error } = await supabase.rpc("rider_daily_stats", { _day: day });
    if (error) return toast.error("Couldn't load riders");
    setRows((data as any) || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [day]);

  const toggle = async (r: RiderStat) => {
    const fn = r.is_active ? "rider_sign_out" : "rider_sign_in";
    const { error } = await supabase.rpc(fn as any, { _id: r.rider_id });
    if (error) return toast.error(error.message);
    toast.success(r.is_active ? `Rider ${r.slot} signed out` : `Rider ${r.slot} signed in`);
    load();
  };

  const startEdit = (r: RiderStat) => { setEditing(r.rider_id); setDraft({ name: r.name, phone: "" }); };
  const saveEdit = async (id: string) => {
    const { error } = await supabase.rpc("update_rider", { _id: id, _name: draft.name, _phone: draft.phone });
    if (error) return toast.error(error.message);
    setEditing(null);
    load();
  };

  const totalDeliveries = rows.reduce((a, r) => a + Number(r.deliveries || 0), 0);
  const totalRevenue = rows.reduce((a, r) => a + Number(r.revenue || 0), 0);
  const activeCount = rows.filter((r) => r.is_active).length;

  return (
    <section className="bg-card rounded-2xl shadow-elegant p-5 mb-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-xl font-extrabold flex items-center gap-2">
          <Bike className="text-primary" /> Riders
          <span className="text-xs text-muted-foreground font-medium">{activeCount}/10 active</span>
        </h2>
        <div className="flex items-center gap-2">
          <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="h-9 w-auto" />
          <Button variant="outline" size="sm" onClick={load}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <Stat label="Active" value={`${activeCount}`} />
        <Stat label="Deliveries" value={`${totalDeliveries}`} />
        <Stat label="Revenue" value={`GHS ${totalRevenue.toFixed(2)}`} />
      </div>

      <div className="grid gap-2">
        {rows.map((r) => (
          <div key={r.rider_id} className={`flex items-center gap-3 p-3 rounded-xl border ${r.is_active ? "border-primary/40 bg-primary/5" : "border-border"}`}>
            <div className={`h-10 w-10 rounded-full grid place-items-center font-bold text-sm shrink-0 ${r.is_active ? "bg-gradient-hero text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
              {r.slot}
            </div>
            <div className="flex-1 min-w-0">
              {editing === r.rider_id ? (
                <div className="flex gap-2">
                  <Input value={draft.name} onChange={(e)=>setDraft({...draft,name:e.target.value})} placeholder="Name" className="h-8 text-sm" />
                  <Input value={draft.phone} onChange={(e)=>setDraft({...draft,phone:e.target.value})} placeholder="Phone" className="h-8 text-sm" />
                </div>
              ) : (
                <>
                  <div className="font-semibold truncate">{r.name || `Rider ${r.slot}`}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.is_active && r.signed_in_at ? `Since ${new Date(r.signed_in_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : "Off duty"}
                  </div>
                </>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-end text-xs gap-0.5 mr-2">
              <span><b>{r.deliveries}</b> delivered</span>
              <span className="text-muted-foreground">{r.in_progress} active · GHS {Number(r.revenue||0).toFixed(2)}</span>
            </div>
            {editing === r.rider_id ? (
              <div className="flex gap-1">
                <Button size="sm" variant="hero" onClick={() => saveEdit(r.rider_id)}><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant={r.is_active ? "outline" : "hero"} onClick={() => toggle(r)}>
                  {r.is_active ? <><PowerOff className="h-4 w-4" /> Sign out</> : <><Power className="h-4 w-4" /> Sign in</>}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        New confirmed requests are auto-assigned to the active rider with the fewest deliveries today (ties: earliest sign-in).
      </p>
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted rounded-xl p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-extrabold text-lg">{value}</div>
  </div>
);