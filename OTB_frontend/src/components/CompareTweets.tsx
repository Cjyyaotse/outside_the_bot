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

const CompareTweets: React.FC<CompareTweetsProps> = ({ locationData }) => {
  // Default mock data for development/fallback
  const defaultLocationData: LocationData[] = [
    {
      name: 'London',
      trendingTopics: [
        { id: '1', label: 'crypto' },
        { id: '2', label: 'sports' },
        { id: '3', label: 'politics' },
        { id: '4', label: 'food' }
      ],
      searchTerm: 'music',
      rawTweets: [
        {
          id: 'london_1',
          content: 'How will this work when you have spunks leaving their trash all over the the site.',
          timeAgo: '1h',
          verified: true
        },
        {
          id: 'london_2',
          content: 'Just discovered an amazing new music venue in London! The acoustics are incredible.',
          timeAgo: '7h',
          verified: true
        },
        {
          id: 'london_3',
          content: 'The underground music scene here is absolutely thriving right now.',
          timeAgo: '12h',
          verified: false
        },
        {
          id: 'london_4',
          content: 'Anyone know good spots for live jazz? Looking for recommendations.',
          timeAgo: '17h',
          verified: false
        }
      ]
    },
    {
      name: 'Istanbul',
      trendingTopics: [
        { id: '1', label: 'food' },
        { id: '2', label: 'houses' },
        { id: '3', label: 'politics' },
        { id: '4', label: 'culture' },
        { id: '5', label: 'tourism' }
      ],
      searchTerm: 'music',
      rawTweets: [
        {
          id: 'istanbul_1',
          content: 'The traditional Turkish music scene is incredible here in Istanbul.',
          timeAgo: '2h',
          verified: true
        },
        {
          id: 'istanbul_2',
          content: 'Best city for fusion of eastern and western musical styles.',
          timeAgo: '8h',
          verified: false
        }
      ]
    }
  ];

  // Use provided data or fallback to mock data
  const dataToUse = locationData || defaultLocationData;

  // Format tweets for each location
  const formattedLocationData = useMemo(() => {
    return dataToUse.map(location => ({
      ...location,
      formattedPosts: formatTweetsForDisplay(location.rawTweets)
    }));
  }, [dataToUse]);

  const renderLocationPanel = (data: LocationData & { formattedPosts: UserPost[] }) => (
    <div className="flex-1 h-[100vh] overflow-auto custom-scrollbar text-white">
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        <MapPin className="text-white" size={16} />
        <span className="text-sm">{data.name}</span>
      </div>

      {/* Search Description */}
      <div className="px-4 pb-[24px] border-b border-[#333639]">
        <div className='p-[20px] rounded-[20px] bg-transparent border-[1px] border-[#333639]'>
          <p className="text-sm text-gray-300 leading-relaxed">
            Looking for "{data.searchTerm || 'music'}" in {data.name}? The search is a bit quiet right now, but conversations about this topic do happen here!
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
      <div className="flex-1">
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
        <div className="p-4 text-center">
          <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
            load more
          </button>
        </div>
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