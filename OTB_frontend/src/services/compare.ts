

export interface CompareResultsType {
  location_index: number;
  lat: number;
  lon: number;
  radius_km: number;
  topic: string;
  tweets: string[];
  summary: {
    description: string;
    "trending topics": string; // Keep original key name with quotes
  };
}


export const getComparedRegions = async ({ locations, radius, topic }: { locations: { lat: number; lon: number }[]; radius: number; topic: string; }): Promise<CompareResultsType[]> => {

  try {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/get_tweets_inspo_batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        locations,
        // for testing
        // locations: [
        //   { lon: -75.04057630341867, lat: 40.01714225600481 },
        //   { lon: -76.01240588563076, lat: 43.256032226468506 }
        // ],
        radius_km: radius,
        topic
      })
    })

    if (!response.ok) {
      throw new Error("Failed to fetch compare response")
    }

    const result = await response.json()
    return result.results
  } catch (error) {
    console.error("Error getting compare tweets from regions:", error)
    throw new Error
  }
}