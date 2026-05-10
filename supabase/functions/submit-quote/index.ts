import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteBody {
  name: string;
  phone: string;
  pickup: string;
  dropoff: string;
  details?: string;
}

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return bad("Method not allowed", 405);

  let body: QuoteBody;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON");
  }

  const name = (body.name ?? "").toString().trim();
  const phone = (body.phone ?? "").toString().trim();
  const pickup = (body.pickup ?? "").toString().trim();
  const dropoff = (body.dropoff ?? "").toString().trim();
  const details = (body.details ?? "").toString().trim().slice(0, 500);

  if (name.length < 2 || name.length > 80) return bad("Invalid name");
  if (phone.length < 7 || phone.length > 20) return bad("Invalid phone");
  if (pickup.length < 2 || pickup.length > 120) return bad("Invalid pickup");
  if (dropoff.length < 2 || dropoff.length > 120) return bad("Invalid dropoff");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("quote_requests")
    .insert({ name, phone, pickup, dropoff, details: details || null })
    .select("id")
    .single();

  if (error) {
    console.error("Insert failed", error);
    return bad("Failed to save submission", 500);
  }

  // Try to dispatch email notification (non-blocking failure)
  try {
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "quote-request-notification",
        recipientEmail: "zygoexpresssupport@gmail.com",
        idempotencyKey: `quote-${data.id}`,
        templateData: { name, phone, pickup, dropoff, details },
      },
    });
  } catch (e) {
    console.warn("Email dispatch skipped:", e);
  }

  return new Response(JSON.stringify({ ok: true, id: data.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});