import { useEffect, useState } from 'react';
import { storyAPI } from '../services/api';

function BookmarkButton({ storyId, initialBookmarked = false, onBookmarkToggle }) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleBookmark = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError('');
      const response = await storyAPI.toggleBookmark(storyId);
      setIsBookmarked(response.data.data.isBookmarked);
      if (onBookmarkToggle) onBookmarkToggle(response.data.data.isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setError(error.response?.data?.message || 'Unable to update saved story.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleBookmark}
        disabled={loading}
        aria-label={isBookmarked ? 'Remove from saved stories' : 'Save story'}
        aria-pressed={isBookmarked}
        className={`flex items-center justify-center rounded-lg p-2 transition-colors disabled:cursor-wait disabled:opacity-60 ${
          isBookmarked
            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isBookmarked ? 'Remove from saved' : 'Save story'}
      >
        <svg className="h-5 w-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>
      {error && (
        <span role="alert" className="absolute right-0 top-full z-10 mt-1 w-48 rounded bg-red-700 px-2 py-1 text-xs text-white shadow">
          {error}
        </span>
      )}
    </div>
  );
}

export default BookmarkButton;