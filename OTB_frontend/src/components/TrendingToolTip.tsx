import React from 'react';

interface TrendingTag {
  id: string;
  name: string;
  count?: number;
}

interface TrendingToolTipProps {
  location: string;
  tags: TrendingTag[];
  onTagClick?: (tag: TrendingTag) => void;
  className?: string;
}

const TrendingToolTip: React.FC<TrendingToolTipProps> = ({
  location,
  tags,
  onTagClick,
  className = ''
}) => {
  const handleTagClick = (tag: TrendingTag) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div className={`
      bg-gradient-to-br from-slate-800 to-slate-900 
      rounded-2xl p-6 
      shadow-2xl shadow-blue-500/20
      border border-slate-700/50
      backdrop-blur-sm
      relative overflow-hidden
      ${className}
    `}>
      {/* Decorative gradient orbs */}
      <div className="absolute top-2 right-2 w-8 h-8 bg-blue-400/20 rounded-full blur-sm"></div>
      <div className="absolute bottom-2 left-2 w-6 h-6 bg-cyan-400/20 rounded-full blur-sm"></div>

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white text-xl font-semibold">
          Trending in {location}
        </h3>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag)}
            className="
              px-4 py-2 
              bg-transparent 
              border border-slate-500/40 
              rounded-full 
              text-white text-sm font-medium
              transition-all duration-200 ease-in-out
              hover:border-blue-400/60 
              hover:bg-blue-400/10
              hover:shadow-md hover:shadow-blue-400/20
              hover:scale-105
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-blue-400/30
            "
          >
            {tag.name}
            {tag.count && (
              <span className="ml-1 text-slate-400 text-xs">
                {tag.count > 1000 ? `${(tag.count / 1000).toFixed(1)}k` : tag.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingToolTip;