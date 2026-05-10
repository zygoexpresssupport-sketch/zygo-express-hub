import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  pickup: z.string().trim().min(2).max(120),
  dropoff: z.string().trim().min(2).max(120),
  details: z.string().trim().max(500).optional(),
});

export const Quote = () => {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("submit-quote", {
      body: parsed.data,
    });
    setLoading(false);
    if (error || (data && (data as any).error)) {
      toast.error("Couldn't send quote. Please try again.");
      return;
    }
    toast.success("Quote request sent! We'll be in touch shortly.");
    form.reset();
  };

  return (
    <section id="quote" className="py-24 bg-gradient-dark text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />
      <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" /> Request a quote
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Tell us where it's going.<br />
            <span className="text-gradient">We'll handle the rest.</span>
          </h2>
          <p className="text-lg opacity-80 max-w-md">
            Share a few details about your shipment and our team will get back with a tailored quote within minutes.
          </p>
        </div>
        <form onSubmit={onSubmit} className="bg-card text-card-foreground p-6 md:p-8 rounded-3xl shadow-elegant space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+233 20 285 8011" required maxLength={20} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pickup">Pickup location</Label>
            <Input id="pickup" name="pickup" placeholder="Address or area" required maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dropoff">Drop-off location</Label>
            <Input id="dropoff" name="dropoff" placeholder="Address or area" required maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="details">Parcel details (optional)</Label>
            <Textarea id="details" name="details" placeholder="Size, weight, special handling…" maxLength={500} rows={3} />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            <Send /> {loading ? "Sending…" : "Get my quote"}
          </Button>
        </form>
      </div>
    </section>
  );
};