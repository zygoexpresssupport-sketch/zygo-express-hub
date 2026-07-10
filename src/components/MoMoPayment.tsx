import { useState } from "react";
import { CheckCircle2, Copy, Phone, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ─── Config ───────────────────────────────────────────────────────────────────
const MOMO_NUMBER = "0559382734";
const MOMO_NAME   = "Zygo Express";

// ─── Types ────────────────────────────────────────────────────────────────────
type MoMoPaymentProps = {
  trackingCode: string;
  amount: number;
  currency?: string;
  onPaymentConfirmed?: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────
export const MoMoPayment = ({
  trackingCode,
  amount,
  currency = "GHS",
  onPaymentConfirmed,
}: MoMoPaymentProps) => {
  const [step, setStep]         = useState<"instructions" | "confirm" | "done">("instructions");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Copy MoMo number to clipboard
  const copyNumber = () => {
    navigator.clipboard.writeText(MOMO_NUMBER);
    toast.success("Number copied!");
  };

  // Customer submits their MoMo reference after paying
  const onSubmitReference = async () => {
    if (reference.trim().length < 4) {
      toast.error("Please enter a valid MoMo reference number");
      return;
    }

    setSubmitting(true);

    // Submit via edge function (service role) — RLS blocks direct client writes by design
    const { data, error } = await supabase.functions.invoke("submit-momo-reference", {
      body: {
        tracking_code: trackingCode.toUpperCase(),
        reference: reference.trim(),
      },
    });

    setSubmitting(false);

    if (error || (data && (data as any).error)) {
      toast.error((data as any)?.error ?? "Could not save reference. Please try again.");
      return;
    }

    setStep("done");
    onPaymentConfirmed?.();
  };

  // ─── Step 1: Instructions ──────────────────────────────────────────────────
  if (step === "instructions") {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-yellow-400 grid place-items-center">
            <Phone className="h-5 w-5 text-yellow-900" />
          </div>
          <div>
            <div className="font-bold text-base">Pay with MTN MoMo</div>
            <div className="text-xs text-muted-foreground">Manual transfer · Instant confirmation</div>
          </div>
        </div>

        {/* Amount */}
        <div className="rounded-xl bg-muted/40 p-4 text-center">
          <div className="text-xs text-muted-foreground mb-1">Amount to send</div>
          <div className="text-3xl font-extrabold">
            {currency} {Number(amount).toFixed(2)}
          </div>
        </div>

        {/* Step by step instructions */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            How to pay
          </div>

          {[
            { step: "1", text: "Dial *170# on your MTN phone" },
            { step: "2", text: "Select Option 1 — Transfer Money" },
            { step: "3", text: "Select Option 2 — MoMo User" },
            { step: "4", text: `Send ${currency} ${Number(amount).toFixed(2)} to the number below` },
            { step: "5", text: "Enter your MoMo PIN to confirm" },
            { step: "6", text: "Copy the reference number from the confirmation SMS" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center shrink-0 mt-0.5">
                {item.step}
              </div>
              <div className="text-sm">{item.text}</div>
            </div>
          ))}
        </div>

        {/* MoMo number */}
        <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">Send to this number</div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-extrabold tracking-wider">{MOMO_NUMBER}</div>
              <div className="text-sm font-medium text-muted-foreground">{MOMO_NAME}</div>
            </div>
            <Button variant="outline" size="sm" onClick={copyNumber}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
        </div>

        {/* Important note */}
        <div className="flex gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <span>
            Use <strong>{trackingCode}</strong> as your payment reference/note if your MoMo allows it.
            This helps us match your payment faster.
          </span>
        </div>

        {/* CTA */}
        <Button
          className="w-full"
          variant="hero"
          size="lg"
          onClick={() => setStep("confirm")}
        >
          I have sent the money →
        </Button>
      </div>
    );
  }

  // ─── Step 2: Confirm reference ─────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
        <div className="text-center space-y-1">
          <div className="font-bold text-lg">Enter your MoMo reference</div>
          <div className="text-sm text-muted-foreground">
            Check your SMS from MTN for a reference number after payment
          </div>
        </div>

        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g. 1234567890"
          className="h-14 text-center text-lg font-bold tracking-widest"
          maxLength={20}
        />

        <Button
          className="w-full"
          variant="hero"
          size="lg"
          onClick={onSubmitReference}
          disabled={submitting}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : (
            "Submit Reference"
          )}
        </Button>

        <button
          className="w-full text-sm text-muted-foreground underline"
          onClick={() => setStep("instructions")}
        >
          ← Back to instructions
        </button>
      </div>
    );
  }

  // ─── Step 3: Done ──────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-green-500/30 bg-green-50 dark:bg-green-950/20 p-6 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-green-500 grid place-items-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-white" />
      </div>
      <div>
        <div className="font-bold text-xl">Payment submitted!</div>
        <div className="text-sm text-muted-foreground mt-1">
          We will verify your MoMo payment and confirm your delivery within <strong>15 minutes</strong>.
          You will receive an SMS once confirmed.
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Tracking ID: <strong>{trackingCode}</strong>
      </div>
    </div>
  );
};
