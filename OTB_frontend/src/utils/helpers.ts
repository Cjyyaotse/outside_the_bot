import type { TweetsResponseTypes } from "../components/SideBar";
import type { CompareResultsType } from "../services/compare";
import type { LocationData, LocationType, RawTweetData, TrendingTopic } from "./types";
import availableCountries from "./availableCountries.json"

export async function reverseGeocode(lng: number, lat: number) {
  const token = import.meta.env.VITE_DEFAULT_PUBLIC_TOKEN;
  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${token}`;

  const res = await fetch(url);
  const data = await res.json();

  // Normalize to LocationSuggestion type
  if (data.features && data.features.length > 0) {
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


export const formatMetric = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}


export const formatAnalysisData = (data: TweetsResponseTypes) => {
  const rawTweets: RawTweetData[] = data?.tweets?.map((tweet, index) => ({
    id: `tweet-${index}`, // Generate unique ID for each tweet
    content: tweet,
    timeAgo: "recent", // Since original data doesn't include time, using placeholder
    verified: false // Default value since original data doesn't include verification status
  }));
  return { rawTweets, summary: data?.summary };
}


// Formatter function
export function formatCompareResults(
  locationResult: CompareResultsType,
  searchTerm?: string
): LocationData {
  // Extract and process trending topics from the summary
  const trendingTopics = parseTrendingTopics(locationResult.summary["trending topics"]);

  // Convert tweets to RawTweetData format
  const rawTweets = formatAnalysisData(locationResult)

  // Generate a location name (you might want to customize this)
  const name = generateLocationName(locationResult);

  return {
    name,
    trendingTopics,
    rawTweets: rawTweets.rawTweets,
    searchTerm,
    radius: locationResult.radius_km,
    description: locationResult.summary.description
  };
}

// Helper function to parse trending topics string into structured data
function parseTrendingTopics(topicsString: string): TrendingTopic[] {
  // Split by commas and clean up the topics
  const topicNames = topicsString.split(',')
    .map(topic => topic.trim())
    .filter(topic => topic.length > 0);

  // Create TrendingTopic objects (you might want to add actual counts if available)
  return topicNames.map((topic, index) => ({
    id: index.toString(),
    label: topic,
  }));
}

// Helper function to generate a location name
function generateLocationName(locationResult: CompareResultsType): string {
  // You can customize this based on your needs
  // Options: Use coordinates, location_index, or reverse geocoding
  return `Location ${locationResult.location_index + 1}`;
  // Or: return `(${locationResult.lat.toFixed(4)}, ${locationResult.lon.toFixed(4)})`;
}

// Alternative: If you want to handle multiple locations at once
export function formatMultipleCompareResults(
  locationResults: CompareResultsType[],
  searchTerm?: string
): LocationData[] {
  return locationResults.map(result =>
    formatCompareResults(result, searchTerm)
  );
}


interface AvailableLocationsTypes {
  lat: number;
  lon: number;
  place_name: string;
  display_name: string;
  address: {
    city?: string;
    village?: string;
    county?: string;
    state?: string;
    country: string;
    country_code: string;
    // Other possible fields
    [key: string]: any;
  };
}

export interface CountryStates {
  country: string;
  states: string[];
}

export function getCountryWithStates(locations: AvailableLocationsTypes[]): CountryStates[] {
  const countryMap = new Map<string, Set<string>>();

  locations.forEach(location => {
    const country = location?.address?.country;
    const state = location?.address?.state || location.address.county || 'Unknown Region';

    if (!countryMap.has(country)) {
      countryMap.set(country, new Set<string>());
    }

    countryMap.get(country)!.add(state);
  });

  // Convert Map to array of objects and sort
  return Array.from(countryMap.entries())
    .map(([country, statesSet]) => ({
      country,
      states: Array.from(statesSet).sort()
    }))
    .sort((a, b) => a.country?.localeCompare(b?.country));
}


// Usage
export const countryStatePairs = getCountryWithStates(availableCountries as AvailableLocationsTypes[]);

