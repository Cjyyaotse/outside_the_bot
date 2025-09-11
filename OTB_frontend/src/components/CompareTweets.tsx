import React from 'react';
// import { X, Upload, TrendingUp } from 'lucide-react';

interface TrendingTopic {
  id: string;
  label: string;
}

interface UserPost {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  timeAgo: string;
  verified?: boolean;
}

interface LocationData {
  name: string;
  trendingTopics: TrendingTopic[];
  posts: UserPost[];
}

const CompareTweets: React.FC = () => {
  const londonData: LocationData = {
    name: 'London',
    trendingTopics: [
      { id: '1', label: 'crypto' },
      { id: '2', label: 'sports' },
      { id: '3', label: 'politics' },
      { id: '4', label: 'food' }
    ],
    posts: [
      {
        id: '1',
        username: 'gentheagoatwarrior',
        handle: '@gentheagoatwarrior',
        avatar: 'blue',
        content: 'How will this work when you have spunks leaving their trash all over the the site.',
        timeAgo: '1h',
        verified: true
      },
      {
        id: '2',
        username: 'thenamesKeqla',
        handle: '@thenamesKeqla',
        avatar: 'gray',
        content: 'How will this work when you have spunks leaving their trash all over the the site.',
        timeAgo: '7h',
        verified: true
      },
      {
        id: '3',
        username: 'HamsterDumpster_Billy',
        handle: '@HamsterDumpster_Billy',
        avatar: 'orange',
        content: 'How will this work when you have spunks leaving their trash all over the the site.',
        timeAgo: '12h',
        verified: true
      },
      {
        id: '4',
        username: 'BearsCore237',
        handle: '@BearsCore237',
        avatar: 'pink',
        content: 'How will this work when you have spunks leaving their trash all over the the site.',
        timeAgo: '17h',
        verified: false
      }
    ]
  };

  const istanbulData: LocationData = {
    name: 'Istanbul',
    trendingTopics: [
      { id: '1', label: 'food' },
      { id: '2', label: 'houses' },
      { id: '3', label: 'politics' },
      { id: '4', label: 'food' },
      { id: '5', label: 'food' },
      { id: '6', label: 'food' },
      { id: '7', label: 'food' },
      { id: '8', label: 'food' },
      { id: '9', label: 'food' }
    ],
    posts: [
      {
        id: '1',
        username: 'gentheagoatwarrior',
        handle: '@gentheagoatwarrior',
        avatar: 'blue',
        content: 'How will this work when you have spunks leaving their trash all over the the site.',
        timeAgo: '1h',
        verified: true
      },
      {
        id: '2',
        username: 'BearsCore237',
        handle: '@BearsCore237',
        avatar: 'pink',
        content: 'How will this work when you have spunks leaving their trash all over the the site.',
        timeAgo: '17h',
        verified: false
      }
    ]
  };

  const getAvatarBgColor = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      gray: 'bg-gray-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const renderLocationPanel = (data: LocationData) => (
    <div className="flex-1 min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-slate-700">
        <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <span className="text-sm">{data.name}</span>
      </div>

      {/* Search Description */}
      <div className="p-4 border-b border-slate-700">
        <p className="text-sm text-gray-300 leading-relaxed">
          Looking for "music" in {data.name}? The search is a bit quiet right now, but conversations about this topic do happen here!
        </p>
      </div>

      {/* Trending Topics */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          {/* <TrendingUp className="w-4 h-4" /> */}
          <h3 className="text-sm font-medium">Trending Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.trendingTopics.map((topic, index) => (
            <button
              key={`${topic.id}-${index}`}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-sm rounded-full transition-colors"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Posts */}
      <div className="flex-1">
        {data.posts.map((post) => (
          <div key={post.id} className="p-4 border-b border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarBgColor(post.avatar)}`}>
                {post.username.slice(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium text-sm truncate">{post.username}</span>
                  {post.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
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
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
        <h1 className="text-white text-lg font-medium">Compare Mode</h1>
        <div className="flex items-center gap-3">
          {/* <Upload className="w-5 h-5 text-white cursor-pointer hover:text-gray-300" /> */}
          {/* <X className="w-5 h-5 text-white cursor-pointer hover:text-gray-300" /> */}
        </div>
      </div>

      {/* Split Panel Content */}
      <div className="flex">
        {/* Left Panel - London */}
        {renderLocationPanel(londonData)}

        {/* Divider */}
        <div className="w-px bg-slate-700"></div>

        {/* Right Panel - Istanbul */}
        {renderLocationPanel(istanbulData)}
      </div>
    </div>
  );
};

export default CompareTweets;