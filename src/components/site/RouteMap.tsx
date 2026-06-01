import { useEffect, useRef } from "react";

type LatLng = { lat: number; lng: number; label?: string };

type RouteMapProps = {
  pickup: LatLng | null;
  dropoff: LatLng | null;
  rider?: LatLng | null;
  height?: number;
};

const buildMapUrl = (pickup: LatLng | null, dropoff: LatLng | null): string => {
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

export const RouteMap = ({ pickup, dropoff, rider, height = 340 }: RouteMapProps) => {
  const mapUrl = buildMapUrl(pickup, dropoff);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-card">
      {mapUrl ? (
        <iframe
          title="Delivery route map"
          src={mapUrl}
          width="100%"
          height={height}
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div style={{ height }} className="bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Map unavailable — coordinates missing
        </div>
      )}

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
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-primary font-semibold">Rider · Live</span>
          </div>
        )}
      </div>
    </div>
  );
};
