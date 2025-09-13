import type { LocationType } from "./types";

export async function reverseGeocode(lng: number, lat: number) {
  const token = import.meta.env.VITE_DEFAULT_PUBLIC_TOKEN;
  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}`;

  const res = await fetch(url);
  const data = await res.json();

  // Normalize to LocationSuggestion type
  if (data && data.features && data.features.length > 0) {
    const f = data.features[0];
    return {
      id: f.id,
      name: f.properties?.name || f.text || "Unknown",
      subtitle: f.properties?.context?.place || f.properties?.full_address || "",
      type: "default" as LocationType,
      coordinates: {
        lat,
        lng
      }
    };
  }
  return null;
}



