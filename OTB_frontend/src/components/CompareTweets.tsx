import React, { useMemo } from 'react';
import TrendingIcon from '../assets/icons/TrendingIcon.svg'
import { MapPin, Upload, X } from 'lucide-react';
import Tag from './Tag';
import Verified from "../assets/icons/Verified.svg"
import { AVATARS, COLORS, USERNAMES } from '../utils/constants';
import type { CompareTweetsProps, LocationData, RawTweetData, UserPost } from '../utils/types';



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
const formatTweetsForDisplay = (rawTweets: RawTweetData[]): UserPost[] => {
  return rawTweets.map((tweet) => {
    const usernameIndex = getSeededRandomIndex(tweet.id, USERNAMES.length);
    const avatarIndex = getSeededRandomIndex(tweet.id + '_avatar', AVATARS.length);
    const bgColorIndex = getSeededRandomIndex(tweet.id + '_color', COLORS.length);
    const selectedUsername = USERNAMES[usernameIndex];

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

const CompareTweets: React.FC<CompareTweetsProps> = ({ locationData, isLoading }) => {
  // Default mock data for development/fallback

  // Use provided data or fallback to mock data
  const dataToUse = locationData;

  // Format tweets for each location
  const formattedLocationData = useMemo(() => {
    return dataToUse.map(location => ({
      ...location,
      formattedPosts: formatTweetsForDisplay(location.rawTweets)
    }));
  }, [dataToUse]);

  console.log("locationdata:::", locationData)

  // show loading skeleton during isLoading
  if (isLoading) {
    return (
      <div className="h-[100vh] backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <div className="h-8 w-40 bg-gray-700 animate-pulse rounded"></div>
          <div className="flex gap-3">
            <div className="h-5 w-5 bg-gray-700 animate-pulse rounded"></div>
            <div className="h-5 w-5 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="flex">
          {[1, 2].map((_, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 h-[100vh] overflow-hidden">
                <div className="p-4">
                  <div className="h-6 w-32 bg-gray-700 animate-pulse rounded mb-4"></div>
                  <div className="h-24 bg-gray-700 animate-pulse rounded mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-gray-700 animate-pulse rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              {index === 0 && <div className="w-px bg-slate-700"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  const renderLocationPanel = (data: LocationData & { formattedPosts: UserPost[] }) => (
    <div className="flex flex-col flex-1 h-[100vh] overflow-auto custom-scrollbar text-white">
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        <MapPin className="text-white" size={16} />
        <span className="text-sm">{data.name}</span>
      </div>

      {/* Search Description */}
      <div className="px-4 pb-[24px] border-b border-[#333639]">
        <div className='p-[20px] rounded-[20px] bg-transparent border-[1px] border-[#333639]'>
          <p className="text-sm text-gray-300 leading-relaxed">
            {
              data.description
            }
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
          {data.trendingTopics.map((topic, index) => (
            <Tag key={`${topic.id}-${index}`} name={topic.label} />
          ))}
        </div>
      </div>

      {/* User Posts */}
      <div className="flex-1 mb-[70px]">
        {data.formattedPosts.map((post) => (
          <div key={post.id} className="p-4 border-b border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer">
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
        {/* <div className="p-4 text-center">
          <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
            load more
          </button>
        </div> */}
      </div>
    </div>
  );

  return (
    <div className="h-[100vh] backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h1 className="text-white text-lg font-medium">Compare Mode</h1>
        <div className="flex items-center gap-3">
          <Upload className="w-5 h-5 text-white cursor-pointer hover:text-gray-300" />
          <X className="w-5 h-5 text-white cursor-pointer hover:text-gray-300" />
        </div>
      </div>

      {/* Split Panel Content */}
      <div className="flex">
        {formattedLocationData.map((location, index) => (
          <React.Fragment key={location.name}>
            {/* Location Panel */}
            {renderLocationPanel(location)}

            {/* Divider (except for last panel) */}
            {index < formattedLocationData.length - 1 && (
              <div className="w-px bg-slate-700"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CompareTweets;