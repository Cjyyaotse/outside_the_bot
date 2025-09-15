import type { TweetsResponseTypes } from "../components/SideBar";

export const getLocationTweets = async (
  radius: number,
  topics: string,
  locations?: {
    lat: number;
    lng: number;
  },
): Promise<TweetsResponseTypes> => {
  try {
    if (!locations) {
      throw new Error("location coordinates are empty")
    }

    console.log("data::", radius, topics, locations)
    // ["-73.63197015422367", "40.561890585516394"]

    // query_lat: "40.561890585516394",
    //   query_lon: "-73.63197015422367",

    // Build query parameters
    const params = new URLSearchParams({
      query_lat: locations.lat.toString(),
      query_lon: locations.lng.toString(),
      radius_km: (300).toString(),
    })

    // Add optional parameters
    if (topics) {
      params.append('topic', topics)
    }

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/get_tweets_inspo?${params}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error("Fetching tweets failed!")
    }
    return response.json()
  } catch (error) {
    console.error("FAILED TO RETRIEVE ANALYSIS TWEETS:", error)
    throw error
  }
}