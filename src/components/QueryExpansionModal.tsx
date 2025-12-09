import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';

interface Subtopic {
  title: string;
  description: string;
  expandedQuery: string;
  category: string;
  isCustom?: boolean;
}

interface QueryExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalQuery: string;
  subtopics: Subtopic[];
  onSelectSubtopic: (subtopic: Subtopic) => void;
  onCustomInput: (customQuery: string) => void;
  isLoading?: boolean;
}

export const QueryExpansionModal: React.FC<QueryExpansionModalProps> = ({
  isOpen,
  onClose,
  originalQuery,
  subtopics,
  onSelectSubtopic,
  onCustomInput,
  isLoading = false
}) => {
  const [customQuery, setCustomQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleCustomSubmit = () => {
    if (customQuery.trim()) {
      onCustomInput(customQuery.trim());
      setCustomQuery('');
      setShowCustomInput(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return '💼';
      case 'technical': return '🔧';
      case 'problems': return '⚠️';
      case 'trending': return '🔥';
      case 'education': return '📚';
      case 'tools': return '🛠️';
      case 'industry': return '🏭';
      default: return '💡';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Choose Your Focus Area
            </h2>
            <p className="text-gray-600 mt-1">
              We found several ways to explore "<span className="font-semibold text-blue-600">{originalQuery}</span>"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Generating options...</span>
            </div>
          ) : (
            <>
              {/* Subtopics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {subtopics.map((subtopic, index) => (
                  <div
                    key={index}
                    onClick={() => onSelectSubtopic(subtopic)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getCategoryIcon(subtopic.category)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {subtopic.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {subtopic.description}
                        </p>
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          Search: "{subtopic.expandedQuery}"
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Input */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Plus className="w-5 h-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">Need something specific?</h3>
                </div>
                
                {showCustomInput ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      placeholder="Type your specific area of interest..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                      autoFocus
                    />
                    <button
                      onClick={handleCustomSubmit}
                      disabled={!customQuery.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Specify your own topic
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
