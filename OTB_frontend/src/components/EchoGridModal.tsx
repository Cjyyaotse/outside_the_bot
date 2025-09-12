import React, { useState } from 'react';


interface GridTypes {
  onClick?: () => void
}

type CategoryTags = {
  culture: string[];
  sports: string[];
  fashion: string[];
}

const EchoGridModal: React.FC<GridTypes> = ({ onClick }) => {
  const [selectedTags, setSelectedTags] = useState<CategoryTags>({
    culture: ['crypto'],
    sports: [],
    fashion: []
  });

  const categories = [
    {
      id: 'culture',
      name: 'Culture',
      icon: '🎭',
      tags: ['art', 'music', 'cinema', 'literature', 'theater', 'history', 'philosophy', 'religion', 'mythology', 'festivals', 'traditions', 'language', 'media', 'photography', 'dance', 'architecture']
    },
    {
      id: 'sports',
      name: 'Sports',
      icon: '🏀',
      tags: ['basketball', 'football', 'soccer', 'tennis', 'baseball', 'golf', 'hockey', 'cricket', 'rugby', 'volleyball', 'swimming', 'athletics', 'boxing', 'cycling', 'skiing', 'martial-arts']
    },
    {
      id: 'fashion',
      name: 'Fashion',
      icon: '👗',
      tags: ['streetwear', 'vintage', 'luxury', 'minimalist', 'bohemian', 'athleisure', 'sustainable', 'accessories', 'footwear', 'denim', 'formal', 'casual', 'designer', 'couture', 'trends', 'seasonal']
    }
  ];

  const toggleTag = (categoryId: keyof CategoryTags, tag: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].includes(tag)
        ? prev[categoryId].filter(t => t !== tag)
        : [...prev[categoryId], tag]
    }));
  };

  return (
    <div className="flex items-center justify-center fixed inset-0 bg-black/20 z-50" onClick={onClick}>
      <div className="bg-[#031018D1]/30 backdrop-blur-sm shadow-sm shadow-[#000000CC] rounded-[16px] max-w-[500px] max-h-[530px]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-[16px] pb-[24px]">
          <h2 className="text-white text-base font-medium">Echo Grid</h2>
        </div>

        {/* Content */}
        <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="space-y-3 px-6">
                {/* Category Header */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <h3 className="text-white font-medium">{category.name}</h3>
                </div>

                {/* Tags Grid */}
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag, index) => {
                    const isSelected = selectedTags[category.id as keyof CategoryTags].includes(tag);
                    const uniqueKey = `${category.id}-${tag}-${index}`;

                    return (
                      <button
                        key={uniqueKey}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTag(category.id as keyof CategoryTags, tag);
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all bg-transparent backdrop-blur-sm duration-200 cursor-pointer ${isSelected
                          ? "text-white border-2 border-[#1DA1F2] text-2xl font-light shadow-[0_0_25px_#1DA1F2] "
                          : 'text-slate-300 hover:text-white border'
                          }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              <hr className="my-6 border-t border-slate-700" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button className="px-4 bg-[#1DA1F2] hover:bg-[#0c80c9] text-white rounded-full font-semibold transition-colors duration-300 ease-in w-fit text-[12px]" onClick={onClick}>
            Reset
          </button>
          <button className="px-4 bg-white rounded-full py-2 text-[#000000] transition-colors font-semibold w-fit text-[12px]" onClick={onClick}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EchoGridModal;