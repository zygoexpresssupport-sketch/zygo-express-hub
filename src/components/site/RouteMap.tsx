import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

// Fix default marker icons in Vite/Leaflet
const icon = L.divIcon({
  className: "",
  html: `<div style="background:hsl(var(--primary));width:18px;height:18px;border-radius:9999px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
const dropIcon = L.divIcon({
  className: "",
  html: `<div style="background:#0f172a;width:18px;height:18px;border-radius:9999px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface Props {
  pickup?: { lat: number; lng: number; label?: string } | null;
  dropoff?: { lat: number; lng: number; label?: string } | null;
  height?: number;
}

export const RouteMap = ({ pickup, dropoff, height = 280 }: Props) => {
  const [route, setRoute] = useState<{ coords: [number, number][]; distance_m: number; duration_s: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRoute(null);
    if (!pickup || !dropoff) return;
    (async () => {
      const { data, error } = await supabase.functions.invoke("osrm-route", {
        body: { pickup, dropoff },
      });
      if (cancelled || error || !data?.coordinates) return;
      setRoute({ coords: data.coordinates, distance_m: data.distance_m, duration_s: data.duration_s });
    })();
    return () => { cancelled = true; };
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  const points = [pickup, dropoff].filter(Boolean) as { lat: number; lng: number }[];
  if (points.length === 0) return null;

  const center: [number, number] =
    points.length === 2
      ? [(points[0].lat + points[1].lat) / 2, (points[0].lng + points[1].lng) / 2]
      : [points[0].lat, points[0].lng];

  return (
    <div className="space-y-2">
      <div style={{ height }} className="rounded-2xl overflow-hidden border border-border">
        <MapContainer
        center={center}
        zoom={points.length === 2 ? 11 : 13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={icon}>
            <Popup>Pickup{pickup.label ? `: ${pickup.label}` : ""}</Popup>
          </Marker>
        )}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={dropIcon}>
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
