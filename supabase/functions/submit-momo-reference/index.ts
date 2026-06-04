import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { tracking_code?: string; reference?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const code = (body.tracking_code ?? "").toString().trim().toUpperCase();
  const reference = (body.reference ?? "").toString().trim();

  if (!/^[A-Z0-9-]{4,24}$/.test(code)) {
    return new Response(JSON.stringify({ error: "Invalid tracking code" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (reference.length < 4 || reference.length > 40) {
    return new Response(JSON.stringify({ error: "Invalid reference" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: row, error: selErr } = await supabase
    .from("quote_requests")
    .select("id, paid_at, payment_reference")
    .eq("tracking_code", code)
    .maybeSingle();

  if (selErr || !row) {
    return new Response(JSON.stringify({ error: "Shipment not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (row.paid_at) {
    return new Response(JSON.stringify({ error: "Already paid" }), {
      status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (row.payment_reference) {
    return new Response(JSON.stringify({ error: "Reference already submitted" }), {
      status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: updErr } = await supabase
    .from("quote_requests")
    .update({ payment_reference: reference, payment_provider: "mtn_momo_manual" })
    .eq("id", row.id)
    .is("paid_at", null)
    .is("payment_reference", null);

  if (updErr) {
    console.error("submit-momo-reference update failed", updErr);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});