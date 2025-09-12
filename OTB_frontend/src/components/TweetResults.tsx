import { MapPin } from 'lucide-react';
import React, { useMemo } from 'react';
import TrendingIcon from '../assets/icons/TrendingIcon.svg'
import Tag from './Tag';
import Verified from "../assets/icons/Verified.svg"
import { AVATARS, COLORS, USERNAMES } from '../constants';


interface TrendingTopic {
  id: string;
  label: string;
}

// Raw tweet data interface (what you'll receive from API)
interface RawTweetData {
  id: string;
  content: string;
  timeAgo: string;
  verified?: boolean;
}

// Formatted user post interface (what gets displayed)
interface UserPost {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  timeAgo: string;
  verified?: boolean;
  bgColor: string;
}

interface TweetResultsProps {
  rawTweets?: RawTweetData[];
  location?: string;
  searchTerm?: string;
}

// Utility function to get a consistent random index based on tweet ID
const getSeededRandomIndex = (id: string, arrayLength: number): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % arrayLength;
};

// Function to format raw tweets into display-ready user posts
export const formatTweetsForDisplay = (rawTweets: RawTweetData[]): UserPost[] => {
  return rawTweets.map((tweet) => {
    const usernameIndex = getSeededRandomIndex(tweet.id, USERNAMES.length);
    const avatarIndex = getSeededRandomIndex(tweet.id + '_avatar', AVATARS.length);
    const bgColorIndex = getSeededRandomIndex(tweet.id + '_color', COLORS.length);
    const selectedUsername = USERNAMES[usernameIndex];

    console.log("avatarIndex", avatarIndex, AVATARS[avatarIndex]);
    return {
      id: tweet.id,
      username: selectedUsername,
      handle: `@${selectedUsername}`,
      avatar: AVATARS[avatarIndex],
      content: tweet.content,
      timeAgo: tweet.timeAgo,
      verified: tweet.verified || Math.random() > 0.7, // 30% chance of being verified if not specified
      bgColor: COLORS[bgColorIndex]
    };
  });
};

const TweetResults: React.FC<TweetResultsProps> = ({
  rawTweets,
  location = "London",
  searchTerm = "music"
}) => {
  // Default mock data (for development/fallback)
  const defaultRawTweets: RawTweetData[] = [
    {
      id: '1',
      content: 'How will this work when you have spunks leaving their trash all over the the site.',
      timeAgo: '2h',
      verified: true
    },
    {
      id: '2',
      content: 'How will this work when you have spunks leaving their trash all over the the site.',
      timeAgo: '3h',
      verified: true
    },
    {
      id: '3',
      content: 'How will this work when you have spunks leaving their trash all over the the site.',
      timeAgo: '7h',
      verified: false
    },
    {
      id: '4',
      content: 'How will this work when you have spunks leaving their trash all over the the site.',
      timeAgo: '11h',
      verified: false
    },
    {
      id: '5',
      content: 'Just discovered an amazing new music venue in London! The acoustics are incredible.',
      timeAgo: '13h',
      verified: true
    },
    {
      id: '6',
      content: 'Anyone heading to the jazz festival this weekend? Looking for recommendations!',
      timeAgo: '14h',
      verified: false
    },
    {
      id: '7',
      content: 'The underground music scene in London is absolutely thriving right now.',
      timeAgo: '15h',
      verified: true
    }
  ];

  const trendingTopics: TrendingTopic[] = [
    { id: '1', label: 'crypto' },
    { id: '2', label: 'sports' },
    { id: '3', label: 'politics' },
    { id: '4', label: 'food' }
  ];

  // Format tweets with random usernames and avatars
  const userPosts = useMemo(() => {
    const tweetsToFormat = rawTweets || defaultRawTweets;
    return formatTweetsForDisplay(tweetsToFormat);
  }, [rawTweets]);

  return (
    <div className="w-full max-w-[500px] bg-transparent backdrop-blur-lg text-white h-[100vh] border-l border-[#808080] overflow-y-scroll custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between py-[24px] px-4">
        <div className="flex items-center gap-1">
          <MapPin className="text-white" size={16} />
          <span className="text-sm">{location}</span>
        </div>
      </div>

      {/* Search Description */}
      <div className="px-4 pb-[24px] border-b border-[#333639]">
        <div className='p-[20px] rounded-[20px] bg-transparent border-[1px] border-[#333639]'>
          <p className="text-sm text-gray-300 leading-relaxed">
            Looking for "{searchTerm}" in {location}? The search is a bit quiet right now, but conversations about this topic do happen here!
          </p>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="p-4 mb-[24px]">
        <div className="flex items-center gap-2 mb-3">
          <img src={TrendingIcon} alt='trending' />
          <h3 className="text-sm font-semibold text-[#CBD5E0]">Trending Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <Tag key={topic.id} name={topic.label} />
          ))}
        </div>
      </div>

      {/* User Posts */}
      <div className="flex-1">
        {userPosts.map((post) => (
          <div key={post.id} className="p-4 border-b border-[#808080] hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden p-2" style={{ backgroundColor: post.bgColor }}>
                <img
                  src={post.avatar}
                  alt={post.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.textContent = post.username.slice(0, 2).toUpperCase();
                  }}
                />
                <span className="text-white text-sm font-medium hidden">
                  {post.username.slice(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium text-sm truncate">{post.username}</span>
                  {post.verified && (
                    <img src={Verified} alt="Verified" />
                  )}
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">{post.timeAgo}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {post.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Load More */}
        <div className="p-4 text-center">
          <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
            load more
          </button>
        </div>
      </div>
    </div>
  );
};

export default TweetResults;