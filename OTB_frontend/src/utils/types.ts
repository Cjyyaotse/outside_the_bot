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