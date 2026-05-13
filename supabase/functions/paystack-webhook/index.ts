import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { createHmac } from "node:crypto";

// Paystack sends server-to-server; CORS not needed but harmless
const corsHeaders = { "Access-Control-Allow-Origin": "*" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const PAYSTACK = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK) return new Response("not configured", { status: 500 });

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", PAYSTACK).update(raw).digest("hex");
  if (signature !== expected) {
    console.warn("Bad Paystack signature");
    return new Response("invalid signature", { status: 401 });
  }

  let evt: any;
  try { evt = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

  if (evt.event !== "charge.success") {
    return new Response("ignored", { status: 200 });
  }

  const code = evt.data?.metadata?.tracking_code as string | undefined;
  const reference = evt.data?.reference as string | undefined;
  if (!code || !reference) return new Response("missing fields", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase.rpc("mark_quote_paid", {
    _tracking_code: code, _reference: reference, _provider: "paystack",
  });
  if (error) {
    console.error("mark_quote_paid failed", error);
    return new Response("db error", { status: 500 });
  }
  console.log(`Paystack payment recorded: ${code} ref=${reference} found=${data}`);
  return new Response("ok", { status: 200 });
});