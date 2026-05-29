// ─── Zygo Express: Auto Delivery Cost Calculator ─────────────────────────────
// Supabase Edge Function
// Triggered automatically when a new order is inserted into quote_requests
// Uses OpenStreetMap (Nominatim) for geocoding + OSRM for road distance
// Price = distance_km * GHS 3.20
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_PER_KM = 3.20;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const OSRM_URL = "https://router.project-osrm.org";

// ── Geocode an address to lat/lng using Nominatim ────────────────────────────
async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Add "Ghana" to improve accuracy for local addresses
    const query = address.toLowerCase().includes("ghana")
      ? address
      : `${address}, Ghana`;

    const url = `${NOMINATIM_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=gh`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "ZygoExpress/1.0 (zygoexpresssupport@gmail.com)",
      },
    });

    const data = await res.json();

    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

// ── Get road distance in meters using OSRM ───────────────────────────────────
async function getRoadDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number | null> {
  try {
    const url =
      `${OSRM_URL}/route/v1/driving/` +
      `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
      `?overview=false`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.[0]) return null;

    return data.routes[0].distance; // meters
  } catch {
    return null;
  }
}

// ── Calculate price from distance ─────────────────────────────────────────────
function calculatePrice(distanceM: number): number {
  const km = distanceM / 1000;
  // Minimum charge: GHS 5 (covers short distances)
  const raw = km * RATE_PER_KM;
  return Math.max(5, Math.ceil(raw * 100) / 100);
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // Allow CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await req.json();

    // Support both direct API calls and Supabase webhook triggers
    const record = body.record ?? body;
    const trackingCode = record.tracking_code;
    const pickup = record.pickup;
    const dropoff = record.dropoff;

    if (!trackingCode || !pickup || !dropoff) {
      return new Response(
        JSON.stringify({ error: "Missing tracking_code, pickup or dropoff" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[Zygo] Calculating cost for ${trackingCode}: ${pickup} → ${dropoff}`);

    // Step 1: Geocode both addresses
    const [originCoords, destCoords] = await Promise.all([
      geocode(pickup),
      geocode(dropoff),
    ]);

    if (!originCoords || !destCoords) {
      console.log(`[Zygo] Geocoding failed for ${trackingCode}`);

      // Fallback: estimate based on average Ghana delivery distance (8km)
      const fallbackDistance = 8000;
      const fallbackPrice = calculatePrice(fallbackDistance);

      const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await sb
        .from("quote_requests")
        .update({
          route_distance_m: fallbackDistance,
          price: fallbackPrice,
        })
        .eq("tracking_code", trackingCode)
        .is("price", null);

      return new Response(
        JSON.stringify({
          success: true,
          fallback: true,
          distance_m: fallbackDistance,
          price: fallbackPrice,
          note: "Geocoding failed — used fallback estimate",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get road distance
    const distanceM = await getRoadDistance(originCoords, destCoords);

    if (!distanceM) {
      return new Response(
        JSON.stringify({ error: "Could not calculate road distance" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 3: Calculate price
    const price = calculatePrice(distanceM);
    const distanceKm = (distanceM / 1000).toFixed(2);

    console.log(`[Zygo] ${trackingCode}: ${distanceKm}km → GHS ${price}`);

    // Step 4: Update the order in Supabase
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await sb
      .from("quote_requests")
      .update({
        route_distance_m: Math.round(distanceM),
        price: price,
        pickup_lat: originCoords.lat,
        pickup_lng: originCoords.lng,
        dropoff_lat: destCoords.lat,
        dropoff_lng: destCoords.lng,
      })
      .eq("tracking_code", trackingCode);

    if (error) {
      console.error("[Zygo] DB update error:", error);
      return new Response(
        JSON.stringify({ error: "Database update failed", details: error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracking_code: trackingCode,
        pickup: pickup,
        dropoff: dropoff,
        pickup_coords: originCoords,
        dropoff_coords: destCoords,
        distance_m: Math.round(distanceM),
        distance_km: distanceKm,
        price_ghs: price,
        rate_per_km: RATE_PER_KM,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("[Zygo] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
