import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, ShieldCheck } from "lucide-react";

type Quote = {
  id: string;
  name: string;
  phone: string;
  pickup: string;
  dropoff: string;
  details: string | null;
  created_at: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [email, setEmail] = useState<string>("");

  const loadQuotes = async () => {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return toast.error("Failed to load quotes");
    setQuotes((data || []) as Quote[]);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/auth", { replace: true });
        return;
      }
      if (!mounted) return;
      setEmail(sess.session.user.email ?? "");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id);
      const admin = (roles || []).some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await loadQuotes();
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

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

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center">Loading…</main>;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-extrabold">
            <ShieldCheck className="text-primary" />
            Admin Dashboard
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <section className="container py-10">
        {!isAdmin ? (
          <div className="max-w-lg mx-auto text-center space-y-4 bg-card p-8 rounded-3xl shadow-elegant">
            <h1 className="text-2xl font-extrabold">No admin access</h1>
            <p className="text-muted-foreground">
              If no admin exists yet, claim it now. Otherwise, ask an existing admin to grant you access.
            </p>
            <Button variant="hero" onClick={claimAdmin}>Claim admin role</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold">Quote Requests <span className="text-muted-foreground text-base font-medium">({quotes.length})</span></h1>
              <Button variant="outline" size="sm" onClick={loadQuotes}>Refresh</Button>
            </div>
            <div className="bg-card rounded-2xl shadow-elegant overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Drop-off</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        No quote requests yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    quotes.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="whitespace-nowrap">{new Date(q.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{q.name}</TableCell>
                        <TableCell><a className="hover:text-primary" href={`tel:${q.phone}`}>{q.phone}</a></TableCell>
                        <TableCell>{q.pickup}</TableCell>
                        <TableCell>{q.dropoff}</TableCell>
                        <TableCell className="max-w-xs whitespace-pre-wrap">{q.details || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}