export interface TrendingTopic {
  id: string;
  label: string;
}

// Raw tweet data interface (what you'll receive from API)
export interface RawTweetData {
  id: string;
  content: string;
  timeAgo: string;
  verified?: boolean;
}

// Formatted user post interface (what gets displayed)
export interface UserPost {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  timeAgo: string;
  verified?: boolean;
  bgColor: string;
}

export interface LocationData {
  name: string;
  trendingTopics: TrendingTopic[];
  rawTweets: RawTweetData[];
  searchTerm?: string;
}

export interface CompareTweetsProps {
  locationData?: LocationData[];
}


export interface TweetResultsProps {
  rawTweets?: RawTweetData[];
  location?: string;
  searchTerm?: string;
}


export type LocationType =
  | 'restaurant'
  | 'retail_store'
  | 'bank'
  | 'hospital'
  | 'school'
  | 'hotel'
  | 'gas_station'
  | 'cafe'
  | 'airport'
  | 'residential'
  | 'shopping_mall'
  | 'park'
  | 'gym'
  | 'default';


export interface LocationSuggestion {
  id: string;
  name: string;
  subtitle?: {
    name: string;
    wikidata_id?: string;
  };
  type: LocationType;
  coordinates?: {
    lat: number;
    lng: number;
  };
  activeInputIndex?: number; // New optional property
}

export interface LocationInputProps {
  value: string;
  onChange: (val: string, location?: LocationSuggestion) => void;
  placeholder?: string;
  suggestions: LocationSuggestion[];
  isLoading?: boolean;
  externalLocation?: LocationSuggestion// New prop for external location
  onFocus?: () => void; // New prop for focus event
}
