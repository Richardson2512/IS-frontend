import React, { useState } from 'react';
import { X, AlertTriangle, TrendingUp, Lightbulb, Search, Check } from 'lucide-react';

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubtopic: {
    title: string;
    description: string;
    expandedQuery: string;
  };
  onSelectCategory: (categories: ('pain-points' | 'trending-ideas' | 'content-ideas')[]) => void;
}

export const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  isOpen,
  onClose,
  selectedSubtopic,
  onSelectCategory
}) => {
  const [selectedCategories, setSelectedCategories] = useState<('pain-points' | 'trending-ideas' | 'content-ideas')[]>([]);

  if (!isOpen) return null;

  const handleCategoryToggle = (categoryId: 'pain-points' | 'trending-ideas' | 'content-ideas') => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSearch = () => {
    if (selectedCategories.length > 0) {
      onSelectCategory(selectedCategories);
      setSelectedCategories([]); // Reset selection
    }
  };

  const handleClose = () => {
    setSelectedCategories([]); // Reset selection when closing
    onClose();
  };

  const categories = [
    {
      id: 'pain-points' as const,
      title: 'Pain Points',
      description: 'Problems, challenges, and frustrations people are facing',
      icon: AlertTriangle,
      color: 'red',
      examples: ['Common issues', 'User complaints', 'Difficulties encountered', 'Problems to solve']
    },
    {
      id: 'trending-ideas' as const,
      title: 'Trending Ideas',
      description: 'Popular discussions, viral content, and emerging trends',
      icon: TrendingUp,
      color: 'orange',
      examples: ['Current buzz', 'Hot topics', 'Viral discussions', 'What\'s popular now']
    },
    {
      id: 'content-ideas' as const,
      title: 'Content Ideas',
      description: 'Solutions, tutorials, guides, and educational content',
      icon: Lightbulb,
      color: 'blue',
      examples: ['How-to guides', 'Educational content', 'Tips and tricks', 'Best practices']
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return {
          border: 'border-red-200 hover:border-red-300',
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          accent: 'text-red-600'
        };
      case 'orange':
        return {
          border: 'border-orange-200 hover:border-orange-300',
          icon: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700',
          accent: 'text-orange-600'
        };
      case 'blue':
        return {
          border: 'border-blue-200 hover:border-blue-300',
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          accent: 'text-blue-600'
        };
      default:
        return {
          border: 'border-gray-200 hover:border-gray-300',
          icon: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700',
          accent: 'text-gray-600'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              What would you like to see?
            </h2>
            <p className="text-gray-600 mt-1">
              For "<span className="font-semibold text-blue-600">{selectedSubtopic.title}</span>"
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Search: "{selectedSubtopic.expandedQuery}"
            </p>
            {selectedCategories.length > 0 && (
              <p className="text-sm text-blue-600 mt-1">
                {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);
              const isSelected = selectedCategories.includes(category.id);
              
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 group relative flex flex-col ${
                    isSelected 
                      ? `${colors.border} shadow-lg bg-opacity-5` 
                      : `${colors.border} hover:shadow-lg`
                  } ${isSelected ? `bg-${category.color}-50` : ''}`}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className={`w-6 h-6 bg-${category.color}-600 rounded-full flex items-center justify-center`}>
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className={`p-3 rounded-full transition-colors mb-4 ${
                      isSelected ? `bg-${category.color}-100` : 'bg-gray-50 group-hover:bg-opacity-80'
                    }`}>
                      <Icon className={`w-8 h-8 ${colors.icon}`} />
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isSelected ? colors.accent : 'text-gray-900'
                    }`}>
                      {category.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {category.description}
                    </p>
                    
                    <div className="space-y-1 mb-4 flex-1">
                      {category.examples.map((example, index) => (
                        <div key={index} className="text-xs text-gray-500">
                          • {example}
                        </div>
                      ))}
                    </div>
                    
                    <div className={`px-4 py-2 rounded-md transition-colors text-sm font-medium mt-auto ${
                      isSelected 
                        ? `bg-${category.color}-600 text-white` 
                        : `bg-gray-200 text-gray-700 group-hover:bg-gray-300`
                    }`}>
                      {isSelected ? 'Selected' : 'Select'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Pro Tip
            </h4>
            <p className="text-sm text-blue-800">
              Select one or more categories to see relevant insights. You can choose multiple categories to get a comprehensive view of your topic.
            </p>
          </div>
          
          {/* Search Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={selectedCategories.length === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedCategories.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>
                {selectedCategories.length === 0 
                  ? 'Select categories to search' 
                  : `Search ${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'}`
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
