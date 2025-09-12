import { MapPin, TrendingUp } from 'lucide-react';
import React from 'react';
import TrendingIcon from '../assets/icons/TrendingIcon.svg'
import Tag from './Tag';

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

const TweetResults: React.FC = () => {
  const trendingTopics: TrendingTopic[] = [
    { id: '1', label: 'crypto' },
    { id: '2', label: 'sports' },
    { id: '3', label: 'politics' },
    { id: '4', label: 'food' }
  ];

  const userPosts: UserPost[] = [
    {
      id: '1',
      username: 'gentheagoatwarrior',
      handle: '@gentheagoatwarrior',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
      content: 'How will this work when you have spunks leaving their trash all over the the site.',
      timeAgo: '2h',
      verified: true
    },
    {
      id: '2',
      username: 'thecunneekeep',
      handle: '@thecunneekeep',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format',
      content: 'How will this work when you have spunks leaving their trash all over the the site.',
      timeAgo: '3h',
      verified: true
    },
    {
      id: '3',
      username: 'HamsterDumpster',
      handle: '@HamsterDumpster',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face&auto=format',
      content: 'How will this work when you have spunks leaving their trash all over the the site.',
      timeAgo: '7h',
      verified: false
    },
    {
      id: '4',
      username: 'BearsOutside37',
      handle: '@BearsOutside37',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=40&h=40&fit=crop&crop=face&auto=format',
      content: 'How will this work when you have spunks leaving their trash all over the the site.',
      timeAgo: '11h',
      verified: false
    },
    {
      id: '5',
      username: 'TechieGuru',
      handle: '@TechieGuru',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format',
      content: 'Just discovered an amazing new music venue in London! The acoustics are incredible.',
      timeAgo: '13h',
      verified: true
    },
    {
      id: '6',
      username: 'MusicLover',
      handle: '@MusicLover',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format',
      content: 'Anyone heading to the jazz festival this weekend? Looking for recommendations!',
      timeAgo: '14h',
      verified: false
    },
    {
      id: '7',
      username: 'ConcertHopper',
      handle: '@ConcertHopper',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=40&h=40&fit=crop&crop=face&auto=format',
      content: 'The underground music scene in London is absolutely thriving right now.',
      timeAgo: '15h',
      verified: true
    }
  ];

  const getAvatarBgColor = (index: number): string => {
    const colors = ['bg-blue-500', 'bg-gray-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };



  return (
    <div className="w-full max-w-[500px] bg-transparent backdrop-blur-lg text-white h-[100vh] border-l border-[#808080] overflow-y-scroll custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between py-[24px] px-4">
        <div className="flex items-center gap-1">
          <MapPin className="text-white" size={16} />
          <span className="text-sm">London</span>
        </div>
      </div>

      {/* Search Description */}
      <div className="px-4 pb-[24px] border-b border-[#333639] ">
        <div className='p-[20px] rounded-[20px] bg-transparent border-[1px] border-[#333639]'>
          <p className="text-sm text-gray-300 leading-relaxed">
            Looking for "music" in London? The search is a bit quiet right now, but conversations about this topic do happen here!
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
        {userPosts.map((post, index) => (
          <div key={post.id} className="p-4 border-b border-[#808080] hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarBgColor(index)}`}>
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
};

export default TweetResults;