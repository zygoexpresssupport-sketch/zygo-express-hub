import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Zap, Shield, TrendingUp, CheckCircle } from "lucide-react";

const BENEFITS = [
  { icon: Zap, title: "Priority Pickups", desc: "Your parcels jump the queue. Dedicated riders assigned to your account." },
  { icon: TrendingUp, title: "Volume Discounts", desc: "The more you send, the less you pay. Custom pricing for regular partners." },
  { icon: Shield, title: "Dedicated Support", desc: "Direct WhatsApp line to our team. No queues, no waiting." },
  { icon: Building2, title: "Dashboard Access", desc: "Track all your deliveries in one place. Full visibility, always." },
];

const TYPES = ["Pharmacy", "Supermarket", "Restaurant", "Hospital/Clinic", "School", "Retail Shop", "E-commerce", "Other"];

export const Partnership = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;

    if (!data.business_name || !data.contact_name || !data.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const { error } = await (supabase.from as any)("partner_requests").insert({
      business_name: data.business_name,
      business_type: data.business_type,
      contact_name:  data.contact_name,
      phone:         data.phone,
      email:         data.email || null,
      location:      data.location || null,
      message:       data.message || null,
      status:        "pending",
      created_at:    new Date().toISOString(),
    });

    setLoading(false);
    if (error) { toast.error("Submission failed. Please try again."); return; }
    setSubmitted(true);
  };

  return (
    <section id="partner" className="py-24 bg-muted/20">
      <div className="container max-w-5xl">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-block text-sm font-bold uppercase tracking-widest text-primary">
            Partner with us
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Grow your business with <span className="text-gradient">Zygo Express</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Join pharmacies, restaurants, shops and businesses across Wa who rely on Zygo Express for fast, reliable deliveries every day.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Benefits */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Why partner with us?</h3>
            <div className="grid grid-cols-1 gap-4">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4 p-4 bg-card border border-border rounded-2xl shadow-card">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center flex-shrink-0">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{b.title}</div>
                    <div className="text-muted-foreground text-sm mt-0.5">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
              <div className="font-bold text-sm text-primary">✓ No registration fee</div>
              <div className="font-bold text-sm text-primary">✓ No monthly commitment</div>
              <div className="font-bold text-sm text-primary">✓ Activated within 24 hours</div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-500/10 grid place-items-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Application Received!</h3>
                <p className="text-muted-foreground text-sm">
                  Thank you for your interest. Our team will contact you within 24 hours to set up your partnership account.
                </p>
                <Button variant="hero" onClick={() => setSubmitted(false)}>Submit Another</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <h3 className="text-xl font-bold mb-2">Register your business</h3>
                <p className="text-sm text-muted-foreground mb-4">No sensitive information required. Just the basics.</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Business Name *</label>
                    <Input name="business_name" placeholder="e.g. Kofi's Pharmacy" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Business Type</label>
                    <select name="business_type" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select type</option>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Location in Wa</label>
                    <Input name="location" placeholder="e.g. Kpaguri" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Contact Name *</label>
                    <Input name="contact_name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Phone Number *</label>
                    <Input name="phone" placeholder="0244 123 456" required type="tel" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Email (optional)</label>
                    <Input name="email" placeholder="business@email.com" type="email" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">How many deliveries per week?</label>
                    <Input name="message" placeholder="e.g. 10-20 deliveries/week" />
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Submitting…" : "Apply for Partnership →"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll contact you within 24 hours · No commitment required
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
