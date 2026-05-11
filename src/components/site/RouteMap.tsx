import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const points = [pickup, dropoff].filter(Boolean) as { lat: number; lng: number }[];
  if (points.length === 0) return null;

  const center: [number, number] =
    points.length === 2
      ? [(points[0].lat + points[1].lat) / 2, (points[0].lng + points[1].lng) / 2]
      : [points[0].lat, points[0].lng];

  return (
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
          <Polyline
            positions={[[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]}
            pathOptions={{ color: "hsl(15 89% 53%)", weight: 4, dashArray: "8 8" }}
          />
        )}
      </MapContainer>
    </div>
  );
};
