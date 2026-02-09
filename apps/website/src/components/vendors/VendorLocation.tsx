"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import type { Vendor } from "@/lib/supabase/vendors";

interface VendorLocationProps {
  vendor: Vendor;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// City coordinates in Tanzania [lng, lat]
const CITY_COORDINATES: Record<string, [number, number]> = {
  "Arusha": [36.6833, -3.3869],
  "Dar es Salaam": [39.2083, -6.1630],
  "Zanzibar": [39.1979, -6.1659],
  "Mwanza": [32.9178, -2.5164],
  "Dodoma": [35.7439, -6.1630],
  "Tanzania": [34.8888, -6.3690], // Center of Tanzania
};

export function VendorLocation({ vendor }: VendorLocationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const locationText = vendor.location?.city
    ? `${vendor.location.city}, ${vendor.location.country || "Tanzania"}`
    : "Tanzania";

  // Get coordinates - use vendor coordinates if available, otherwise use city lookup
  const getCoordinates = (): [number, number] => {
    if (vendor.location?.coordinates) {
      return [vendor.location.coordinates.lng, vendor.location.coordinates.lat];
    }
    
    const city = vendor.location?.city || "Tanzania";
    return CITY_COORDINATES[city] || CITY_COORDINATES["Tanzania"];
  };

  const defaultCoords = getCoordinates();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainer.current || map.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        if (!MAPBOX_TOKEN) {
          if (mounted) {
            setMapError("Map unavailable. Missing NEXT_PUBLIC_MAPBOX_TOKEN.");
          }
          return;
        }

        // Dynamic import for client-side only
        const mapboxgl = (await import("mapbox-gl")).default;

        if (!mounted || !mapContainer.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: defaultCoords,
          zoom: 12,
          attributionControl: false,
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Add marker
        markerRef.current = new mapboxgl.Marker({
          color: "#FFB400",
          scale: 1.2,
        })
          .setLngLat(defaultCoords)
          .addTo(map.current);

        map.current.on("load", () => {
          if (mounted) {
            setMapLoaded(true);
            setMapError(null);
          }
        });

        map.current.on("error", (e: any) => {
          console.error("Mapbox error:", e);
          if (mounted) {
            setMapError("Failed to load map. Please check your Mapbox token.");
          }
        });
      } catch (error: any) {
        console.error("Error loading Mapbox:", error);
        if (mounted) {
          setMapError(
            error?.message?.includes("Cannot find module") 
              ? "Map library not installed. Please run: npm install mapbox-gl @types/mapbox-gl"
              : "Failed to load map. Please check the console for details."
          );
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isClient, defaultCoords]);

  return (
    <div
      id="section-location"
      className="pt-12 border-t border-border scroll-mt-32 lg:scroll-mt-40"
    >
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">Where the vendor is based</h2>
      <p className="text-secondary mb-6">{locationText}</p>

      {/* Mapbox Map */}
      <div className="border border-border rounded-2xl overflow-hidden bg-surface mb-6 relative">
        <div ref={mapContainer} className="relative h-[380px] md:h-[480px] w-full" />
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="text-secondary">Loading map...</div>
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="text-center p-4">
              <MapPin className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-secondary text-sm">{mapError}</p>
              <p className="text-secondary/60 text-xs mt-2">
                Location: {locationText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Verification Message */}
      <div className="flex items-start gap-3 p-4 border border-border rounded-lg bg-background">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm">
            This vendor's location is verified, and the exact location will be provided after booking.
          </p>
          <a
            href="#"
            className="text-sm text-primary hover:underline mt-1 inline-block"
          >
            Learn about verification
          </a>
        </div>
      </div>
    </div>
  );
}
