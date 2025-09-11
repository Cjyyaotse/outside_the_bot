import React, { useState } from 'react';


interface GridTypes {
  onClick?: () => void
}

const EchoGridModal: React.FC<GridTypes> = ({ onClick }) => {
  const [selectedTags, setSelectedTags] = useState({
    culture: ['crypto'],
    sports: [],
    fashion: []
  });

  const categories = [
    {
      id: 'culture',
      name: 'Culture',
      icon: '🎭',
      tags: ['crypto', 'sports', 'politics', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food']
    },
    {
      id: 'sports',
      name: 'Sports',
      icon: '🏀',
      tags: ['crypto', 'sports', 'politics', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food']
    },
    {
      id: 'fashion',
      name: 'Fashion',
      icon: '👗',
      tags: ['crypto', 'sports', 'politics', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food', 'food']
    }
  ];

  const toggleTag = (categoryId: string, tag: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].includes(tag)
        ? prev[categoryId].filter(t => t !== tag)
        : [...prev[categoryId], tag]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-white text-xl font-medium">Echo Grid</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <h3 className="text-white font-medium">{category.name}</h3>
              </div>

              {/* Tags Grid */}
              <div className="flex flex-wrap gap-2">
                {category.tags.map((tag, index) => {
                  const isSelected = selectedTags[category.id].includes(tag);
                  const uniqueKey = `${category.id}-${tag}-${index}`;

                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => toggleTag(category.id, tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${isSelected
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button className="px-4 py-2 text-slate-300 hover:text-white transition-colors" onClick={onClick}>
            Save
          </button>
          <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/25">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default EchoGridModal;