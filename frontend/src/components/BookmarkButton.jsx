import { useState } from 'react';
import { storyAPI } from '../services/api';

function BookmarkButton({ storyId, initialBookmarked = false, onBookmarkToggle }) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleBookmark = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const response = await storyAPI.toggleBookmark(storyId);
      setIsBookmarked(response.data.data.isBookmarked);
      if (onBookmarkToggle) onBookmarkToggle(response.data.data.isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBookmark();
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
        isBookmarked
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={isBookmarked ? 'Remove from saved' : 'Save story'}
    >
      <svg
        className="w-5 h-5"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        onKeyDown={handleKeyPress}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}

export default BookmarkButton;