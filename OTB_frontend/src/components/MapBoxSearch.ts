// mapboxSearch.ts
import { SearchBoxCore } from "@mapbox/search-js-core";

const searchClient = new SearchBoxCore({
  accessToken: import.meta.env.VITE_DEFAULT_PUBLIC_TOKEN,
});

export const searchLocations = async (query: string) => {
  if (!query.trim()) return [];
  const response = await searchClient.suggest(query, {
    limit: 10, // control how many results
    language: "en",
    sessionToken: "my-session", // optional for billing optimization
  });


  const results = await Promise.all(
    response.suggestions.map(async (s) => {
      try {
        const detail = await searchClient.retrieve(s, {
          sessionToken: "my-session",
        })

        console.log("Detail for suggestion:", s, detail);
        return {
          id: s.mapbox_id,
          name: s.name,
          subtitle: { name: s.place_formatted },
          type: (s.feature_type || "poi") as any,
          coordinates: detail?.features?.[0]?.geometry?.coordinates
            ? {
              lng: detail.features[0].geometry.coordinates[0],
              lat: detail.features[0].geometry.coordinates[1],
            }
            : undefined,
        };
      } catch (error) {
        console.error("Error retrieving details for suggestion:", s, error);
        return {
          id: s.mapbox_id,
          name: s.name,
          subtitle: { name: s.place_formatted },
          type: (s.feature_type || "poi") as any,
          coordinates: undefined,
        };
      }
    })
  )


  return results;
};
