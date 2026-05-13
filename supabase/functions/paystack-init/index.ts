import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const PAYSTACK = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK) {
    return new Response(JSON.stringify({ error: "Payments not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { tracking_code?: string; email?: string; callback_url?: string };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const code = (body.tracking_code ?? "").toString().trim().toUpperCase();
  const email = (body.email ?? "").toString().trim() || "guest@zygoexpress.com";
  if (!/^[A-Z0-9-]{4,24}$/.test(code)) {
    return new Response(JSON.stringify({ error: "Invalid tracking code" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: row, error } = await supabase
    .from("quote_requests")
    .select("id, tracking_code, price, paid_at, phone, name")
    .eq("tracking_code", code)
    .maybeSingle();

  if (error || !row) {
    return new Response(JSON.stringify({ error: "Shipment not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!row.price || Number(row.price) <= 0) {
    return new Response(JSON.stringify({ error: "Price not set yet — contact support" }), {
      status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (row.paid_at) {
    return new Response(JSON.stringify({ error: "Already paid" }), {
      status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const reference = `ZGX-${code}-${Date.now()}`;
  const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { "Authorization": `Bearer ${PAYSTACK}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      amount: Math.round(Number(row.price) * 100), // pesewas
      currency: "GHS",
      reference,
      callback_url: body.callback_url || undefined,
      channels: ["mobile_money", "card", "bank"],
      metadata: { tracking_code: code, customer_phone: row.phone, customer_name: row.name },
    }),
  });
  const j = await initRes.json();
  if (!initRes.ok || !j?.status) {
    console.error("Paystack init failed", j);
    return new Response(JSON.stringify({ error: j?.message || "Paystack error" }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    authorization_url: j.data.authorization_url,
    reference: j.data.reference,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});