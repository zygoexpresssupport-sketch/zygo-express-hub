import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// Free OSM geocoding — best-effort
async function geocode(q: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { "User-Agent": "ZygoExpress/1.0" } });
    if (!r.ok) return null;
    const j = await r.json();
    if (!Array.isArray(j) || j.length === 0) return null;
    return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
  } catch { return null; }
}

async function sendTelegram(text: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  const CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !CHAT_ID) {
    console.warn("Telegram not configured, skipping");
    return { ok: false, reason: "not_configured" };
  }
  const res = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`Telegram send failed [${res.status}]: ${txt}`);
    return { ok: false, reason: `${res.status}: ${txt.slice(0,200)}` };
  }
  return { ok: true };
}

async function sendSms(to: string, body: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
  const FROM = Deno.env.get("TWILIO_FROM_NUMBER");
  if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !FROM) {
    console.warn("Twilio not fully configured, skipping SMS");
    return { ok: false, reason: "not_configured" };
  }
  const res = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TWILIO_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: FROM, Body: body }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`Twilio SMS failed [${res.status}]: ${txt}`);
    return { ok: false, reason: `${res.status}: ${txt.slice(0,200)}` };
  }
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return bad("Method not allowed", 405);

  let body: QuoteBody;
  try { body = await req.json(); } catch { return bad("Invalid JSON"); }

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

  // Best-effort geocoding (do both in parallel)
  const [pickupGeo, dropoffGeo] = await Promise.all([geocode(pickup), geocode(dropoff)]);

  const { data, error } = await supabase
    .from("quote_requests")
    .insert({
      name, phone, pickup, dropoff,
      details: details || null,
      source: "website",
      pickup_lat: pickupGeo?.lat ?? null,
      pickup_lng: pickupGeo?.lng ?? null,
      dropoff_lat: dropoffGeo?.lat ?? null,
      dropoff_lng: dropoffGeo?.lng ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Insert failed", error);
    return bad("Failed to save submission", 500);
  }

  // Notify admin — Telegram primary, SMS backup
  const plain = `🚀 New Zygo quote\n${name} (${phone})\nFrom: ${pickup}\nTo: ${dropoff}${details ? `\n${details.slice(0,120)}` : ""}`;
  const html = `🚀 <b>New Zygo quote</b>\n<b>${name}</b> (${phone})\n<b>From:</b> ${pickup}\n<b>To:</b> ${dropoff}${details ? `\n${details.slice(0,160)}` : ""}`;

  const tg = await sendTelegram(html);
  if (!tg.ok) console.warn("Telegram alert failed:", tg.reason);

  const ADMIN = Deno.env.get("TWILIO_ADMIN_NUMBER");
  if (ADMIN) {
    sendSms(ADMIN, plain).then((r) => {
      if (!r.ok) console.warn("SMS alert failed:", r.reason);
    }).catch((e) => console.warn("SMS error:", e));
  }

  return new Response(JSON.stringify({ ok: true, id: data.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
