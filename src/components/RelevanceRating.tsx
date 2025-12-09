import React, { useState } from 'react';

interface RelevanceRatingProps {
  postId: string;
  platform: string;
  searchQuery: string;
  userId?: string;
  onRatingSubmit?: (rating: number) => void;
  initialRating?: number;
  disabled?: boolean;
}

const RelevanceRating: React.FC<RelevanceRatingProps> = ({
  postId,
  platform,
  searchQuery,
  userId,
  onRatingSubmit,
  initialRating = 0,
  disabled = false
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingSubmit = async (newRating: number) => {
    if (disabled || isSubmitting || newRating === rating) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backend-production-be5d.up.railway.app/api';
      const apiUrl = backendUrl.endsWith('/api') 
        ? `${backendUrl}/ratings/submit`
        : `${backendUrl}/api/ratings/submit`;
      console.log('Submitting rating to:', apiUrl);
      console.log('Rating data:', { searchQuery, postId, platform, rating: newRating, userId });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchQuery,
          postId,
          platform,
          rating: newRating,
          userId
        })
      });

      console.log('Rating API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 503) {
          // Rating system not available
          console.warn('Rating system not available:', errorData.error);
          setError('Rating system temporarily unavailable');
          setTimeout(() => setError(null), 3000);
          return;
        }
        throw new Error(errorData.error || `Failed to submit rating (${response.status})`);
      }

      const result = await response.json();
      console.log('Rating submitted successfully:', result);

      setRating(newRating);
      setIsSubmitted(true);
      onRatingSubmit?.(newRating);

      // Show success message briefly
      setTimeout(() => setIsSubmitted(false), 2000);

    } catch (error) {
      console.error('Rating submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit rating';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    handleRatingSubmit(starRating);
  };

  const handleStarHover = (starRating: number) => {
    if (!disabled && !isSubmitting) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !isSubmitting) {
      setHoveredRating(0);
    }
  };

  const getStarColor = (starIndex: number) => {
    const activeRating = hoveredRating || rating;
    if (starIndex <= activeRating) {
      if (activeRating <= 2) return 'text-red-400';
      if (activeRating <= 3) return 'text-yellow-400';
      return 'text-green-400';
    }
    return 'text-gray-300';
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 0: return 'Not relevant';
      case 1: return 'Very poor';
      case 2: return 'Poor';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Rate relevance';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled || isSubmitting}
            className={`transition-colors duration-150 ${
              disabled || isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
            title={`Rate ${star} star${star > 1 ? 's' : ''} - ${getRatingText(star)}`}
          >
            <svg
              className={`w-4 h-4 transition-colors duration-150 ${getStarColor(star)}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      
      {rating > 0 && (
        <span className={`text-xs font-medium transition-colors duration-150 ${
          rating <= 2 ? 'text-red-600' : 
          rating <= 3 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {getRatingText(rating)}
        </span>
      )}

      {isSubmitting && (
        <div className="flex items-center space-x-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
          <span className="text-xs text-gray-500">Submitting...</span>
        </div>
      )}

      {isSubmitted && !error && (
        <span className="text-xs text-green-600 font-medium">
          ✓ Rated
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600 font-medium">
          ✗ {error}
        </span>
      )}

      {!rating && !isSubmitting && !error && (
        <span className="text-xs text-gray-500">
          Rate relevance
        </span>
      )}
    </div>
  );
};

export default RelevanceRating;
