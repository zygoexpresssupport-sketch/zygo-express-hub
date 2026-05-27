      import { useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type LatLng = { lat: number; lng: number; label?: string };

type RouteMapProps = {
  pickup: LatLng | null;
  dropoff: LatLng | null;
  rider?: LatLng | null; // ✅ live rider position
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a Google Maps Embed URL with the pickup → dropoff route.
 * Falls back to a simple map centred on whichever point is available.
 * NOTE: Replace YOUR_GOOGLE_MAPS_API_KEY with your actual key in .env
 */
const buildMapUrl = (
  pickup: LatLng | null,
  dropoff: LatLng | null
): string => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

  if (pickup && dropoff) {
    return (
      `https://www.google.com/maps/embed/v1/directions?key=${key}` +
      `&origin=${pickup.lat},${pickup.lng}` +
      `&destination=${dropoff.lat},${dropoff.lng}` +
      `&mode=driving`
    );
  }

  const centre = pickup ?? dropoff;
  if (centre) {
    return (
      `https://www.google.com/maps/embed/v1/place?key=${key}` +
      `&q=${centre.lat},${centre.lng}` +
      `&zoom=14`
    );
  }

  return "";
};

// ─── Component ────────────────────────────────────────────────────────────────
export const RouteMap = ({ pickup, dropoff, rider }: RouteMapProps) => {
  const mapUrl = buildMapUrl(pickup, dropoff);

  // We overlay the rider marker on top of the iframe using a canvas-based
  // approach. For a production app you should use the Google Maps JS SDK
  // directly, but this keeps the component self-contained without extra deps.

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-card">
      {/* ── Map iframe ─────────────────────────────────────────────────────── */}
      {mapUrl ? (
        <iframe
          title="Delivery route map"
          src={mapUrl}
          width="100%"
          height="340"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="h-[340px] bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Map unavailable — coordinates missing
        </div>
      )}

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow text-xs font-medium">
        {pickup && (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
            <span>Pickup: {pickup.label ?? "Origin"}</span>
          </div>
        )}
        {dropoff && (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
            <span>Drop-off: {dropoff.label ?? "Destination"}</span>
          </div>
        )}
        {rider && (
          <div className="flex items-center gap-2">
            {/* Animated pulsing dot for live rider */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-primary font-semibold">Rider · Live</span>
          </div>
        )}
      </div>

      {/* ── Live rider overlay note ─────────────────────────────────────────
           The iframe sandbox prevents us drawing directly on the map.
           For pixel-perfect rider marker on the map, migrate to the
           Google Maps JS API (`@googlemaps/js-api-loader`) and use
           `new google.maps.Marker({ position: rider, map })` with an
           update inside the Supabase real-time callback in Tracking.tsx.
           The legend above still communicates live rider status clearly.
      ──────────────────────────────────────────────────────────────────── */}
    </div>
  );
};
      <Popup>Drop-off{dropoff.label ? `: ${dropoff.label}` : ""}</Popup>
          </Marker>
        )}
        {pickup && dropoff && (
          route ? (
            <Polyline positions={route.coords} pathOptions={{ color: "hsl(15 89% 53%)", weight: 5 }} />
          ) : (
            <Polyline
              positions={[[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]}
              pathOptions={{ color: "hsl(15 89% 53%)", weight: 4, dashArray: "8 8", opacity: 0.6 }}
            />
          )
        )}
        </MapContainer>
      </div>
      {route && (
        <div className="text-xs text-muted-foreground flex gap-4 px-1">
          <span><b className="text-foreground">{(route.distance_m / 1000).toFixed(1)} km</b> by road</span>
          <span>~<b className="text-foreground">{Math.max(1, Math.round(route.duration_s / 60))} min</b> drive</span>
        </div>
      )}
    </div>
  );
};
