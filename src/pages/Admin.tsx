import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LogOut, ShieldCheck, Plus, MapPin, CheckCircle2, Copy, BellRing } from "lucide-react";
import { RouteMap } from "@/components/site/RouteMap";
import { RidersDashboard } from "@/components/admin/RidersDashboard";

type Quote = {
  id: string;
  name: string;
  phone: string;
  pickup: string;
  dropoff: string;
  details: string | null;
  source: string;
  status: string;
  tracking_code: string | null;
  confirmed_at: string | null;
  created_at: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  price: number | null;
  assigned_rider_id: string | null;
};

const STATUS_OPTIONS = [
  "pending", "confirmed", "picked_up", "in_transit", "out_for_delivery", "delivered", "cancelled",
];

const SOURCES = ["website", "whatsapp", "instagram", "tiktok", "facebook", "x", "phone", "other"];

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<Quote | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [history, setHistory] = useState<any | null>(null);
  const [priceDraft, setPriceDraft] = useState<string>("");
  const seenIds = useRef<Set<string>>(new Set());

  const loadQuotes = async () => {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return toast.error("Failed to load quotes");
    const list = (data || []) as Quote[];
    setQuotes(list);
    seenIds.current = new Set(list.map((q) => q.id));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth", { replace: true }); return; }
      if (!mounted) return;
      setEmail(sess.session.user.email ?? "");
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", sess.session.user.id);
      const admin = (roles || []).some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await loadQuotes();
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  // Realtime alerts
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("quote_requests_admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "quote_requests" }, (payload) => {
        const q = payload.new as Quote;
        if (seenIds.current.has(q.id)) return;
        seenIds.current.add(q.id);
        setQuotes((prev) => [q, ...prev]);
        try { new Audio("data:audio/wav;base64,UklGRl9vAQBXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQ==").play().catch(()=>{}); } catch {}
        toast.success(`🔔 New request from ${q.name}`, { description: `${q.pickup} → ${q.dropoff}` });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "quote_requests" }, (payload) => {
        const q = payload.new as Quote;
        setQuotes((prev) => prev.map((x) => (x.id === q.id ? q : x)));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const claimAdmin = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) return toast.error(error.message);
    if (data === true) {
      toast.success("You are now the admin.");
      setIsAdmin(true);
      await loadQuotes();
    } else {
      toast.error("An admin already exists. Ask them to grant you access.");
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate("/auth", { replace: true }); };

  const confirmQuote = async (q: Quote) => {
    const { data, error } = await supabase.rpc("confirm_quote", { _id: q.id });
    if (error) return toast.error(error.message);
    toast.success(`Tracking code: ${data}`);
    await loadQuotes();
    if (selected?.id === q.id) setSelected({ ...q, tracking_code: data as string, status: "confirmed" });
  };

  const setStatus = async (q: Quote, status: string) => {
    const { error } = await supabase.rpc("update_quote_status", { _id: q.id, _status: status });
    if (error) return toast.error(error.message);
    toast.success(`Status → ${status}`);
  };

  const savePrice = async (q: Quote) => {
    const n = Number(priceDraft);
    if (isNaN(n) || n < 0) return toast.error("Invalid price");
    const { error } = await supabase.rpc("set_quote_price", { _id: q.id, _price: n });
    if (error) return toast.error(error.message);
    toast.success("Price saved");
    loadQuotes();
  };

  // load customer history when a quote is opened
  useEffect(() => {
    if (!selected) { setHistory(null); return; }
    setPriceDraft(selected.price != null ? String(selected.price) : "");
    supabase.rpc("customer_history", { _phone: selected.phone }).then(({ data }) => {
      setHistory((data as any)?.[0] ?? null);
    });
  }, [selected]);

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied"); };

  if (loading) return <main className="min-h-screen flex items-center justify-center">Loading…</main>;

  return (
    <main className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Dashboard — Zygo Express</title>
        <meta name="description" content="Operator dashboard for managing Zygo Express delivery requests and riders." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://zygo-express-hub.lovable.app/admin" />
        <meta property="og:title" content="Admin Dashboard — Zygo Express" />
        <meta property="og:url" content="https://zygo-express-hub.lovable.app/admin" />
      </Helmet>
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-extrabold">
            <ShieldCheck className="text-primary" /> Admin Dashboard
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <section className="container py-8">
        {!isAdmin ? (
          <div className="max-w-lg mx-auto text-center space-y-4 bg-card p-8 rounded-3xl shadow-elegant">
            <h1 className="text-2xl font-extrabold">No admin access</h1>
            <p className="text-muted-foreground">If no admin exists yet, claim it now.</p>
            <Button variant="hero" onClick={claimAdmin}>Claim admin role</Button>
          </div>
        ) : (
          <>
            <RidersDashboard />
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 className="text-3xl font-extrabold flex items-center gap-2">
                <BellRing className="text-primary" /> Requests
                <span className="text-muted-foreground text-base font-medium">({quotes.length})</span>
              </h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={loadQuotes}>Refresh</Button>
                <ManualEntryButton open={manualOpen} setOpen={setManualOpen} onSaved={loadQuotes} />
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-elegant overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No requests yet.</TableCell></TableRow>
                  ) : quotes.map((q) => (
                    <TableRow key={q.id} className="cursor-pointer" onClick={() => setSelected(q)}>
                      <TableCell className="whitespace-nowrap text-xs">{new Date(q.created_at).toLocaleString()}</TableCell>
                      <TableCell><span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{q.source}</span></TableCell>
                      <TableCell className="font-medium">{q.name}</TableCell>
                      <TableCell><a className="hover:text-primary" href={`tel:${q.phone}`} onClick={(e)=>e.stopPropagation()}>{q.phone}</a></TableCell>
                      <TableCell className="text-xs">{q.pickup} → {q.dropoff}</TableCell>
                      <TableCell><span className="text-xs font-semibold capitalize">{q.status.replace(/_/g," ")}</span></TableCell>
                      <TableCell className="font-mono text-xs">{q.tracking_code ?? "—"}</TableCell>
                      <TableCell className="text-right" onClick={(e)=>e.stopPropagation()}>
                        {!q.tracking_code ? (
                          <Button size="sm" variant="hero" onClick={() => confirmQuote(q)}>
                            <CheckCircle2 className="h-4 w-4" /> Confirm
                          </Button>
                        ) : (
                          <Select defaultValue={q.status} onValueChange={(v) => setStatus(q, v)}>
                            <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace(/_/g," ")}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Request details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={selected.name} />
                <Field label="Phone" value={selected.phone} />
                <Field label="Source" value={selected.source} />
                <Field label="Status" value={selected.status.replace(/_/g," ")} />
                <Field label="Pickup" value={selected.pickup} />
                <Field label="Drop-off" value={selected.dropoff} />
              </div>
              {selected.tracking_code && (
                <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Tracking code</div>
                    <div className="font-mono font-bold">{selected.tracking_code}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copy(selected.tracking_code!)}><Copy className="h-4 w-4" /> Copy</Button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Price (GHS)</Label>
                  <Input type="number" step="0.01" min="0" value={priceDraft} onChange={(e)=>setPriceDraft(e.target.value)} />
                </div>
                <Button variant="hero" onClick={() => savePrice(selected)}>Save price</Button>
              </div>
              {history && Number(history.total_requests) > 1 && (
                <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3 text-xs">
                  <div>
                    <span className="font-bold uppercase mr-2">{history.tier}</span>
                    Repeat customer · {history.delivered} delivered of {history.total_requests} requests
                  </div>
                  <div className="text-muted-foreground">Spent GHS {Number(history.total_spent||0).toFixed(2)}</div>
                </div>
              )}
              {selected.details && (
                <div><div className="text-xs text-muted-foreground">Details</div><div className="whitespace-pre-wrap">{selected.details}</div></div>
              )}
              {(selected.pickup_lat || selected.dropoff_lat) ? (
                <RouteMap
                  height={260}
                  pickup={selected.pickup_lat && selected.pickup_lng ? { lat: selected.pickup_lat, lng: selected.pickup_lng, label: selected.pickup } : null}
                  dropoff={selected.dropoff_lat && selected.dropoff_lng ? { lat: selected.dropoff_lat, lng: selected.dropoff_lng, label: selected.dropoff } : null}
                />
              ) : (
                <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Map unavailable — addresses couldn't be geocoded.</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium capitalize">{value}</div></div>
);

const ManualEntryButton = ({ open, setOpen, onSaved }: { open: boolean; setOpen: (b: boolean)=>void; onSaved: ()=>void }) => {
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase.rpc("log_manual_request", {
      _name: String(fd.get("name") || ""),
      _phone: String(fd.get("phone") || ""),
      _pickup: String(fd.get("pickup") || ""),
      _dropoff: String(fd.get("dropoff") || ""),
      _details: String(fd.get("details") || ""),
      _source: String(fd.get("source") || "manual"),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Request logged");
    setOpen(false);
    onSaved();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Log social DM</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Log a request from social media / call</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input name="name" required maxLength={80} /></div>
            <div><Label>Phone</Label><Input name="phone" required maxLength={20} /></div>
          </div>
          <div><Label>Pickup</Label><Input name="pickup" required maxLength={120} /></div>
          <div><Label>Drop-off</Label><Input name="dropoff" required maxLength={120} /></div>
          <div><Label>Source</Label>
            <select name="source" defaultValue="whatsapp" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {SOURCES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <div><Label>Details</Label><Textarea name="details" maxLength={500} rows={3} /></div>
          <DialogFooter>
            <Button type="submit" variant="hero" disabled={saving}>{saving ? "Saving…" : "Save request"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
