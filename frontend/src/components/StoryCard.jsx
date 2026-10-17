import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storyAPI } from '../services/api';

function StoryCard({ story, onStoryUpdate }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(story.likesCount || 0);
  const [bookmarksCount, setBookmarksCount] = useState(story.bookmarksCount || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This would need to check if current user has liked/bookmarked
    // For now, we'll handle this through the parent component passing user context
  }, []);

  useEffect(() => {
    // This would need to check if current user has liked/bookmarked
    // For now, we'll handle this through the parent component passing user context
  }, []);

  const handleLike = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const response = await storyAPI.toggleLike(story._id);
      setIsLiked(response.data.data.isLiked);
      setLikesCount(response.data.data.likesCount);
      if (onStoryUpdate) onStoryUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const response = await storyAPI.toggleBookmark(story._id);
      setIsBookmarked(response.data.data.isBookmarked);
      setBookmarksCount(prev => response.data.data.isBookmarked ? prev + 1 : prev - 1);
      if (onStoryUpdate) onStoryUpdate();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100">
      <Link to={`/story/${story._id}`} className="block">
        {story.coverImage && (
          <div className="relative h-52 overflow-hidden">
            <img
              src={story.coverImage}
              alt={story.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 to-transparent" />
          </div>
        )}

        <div className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
              {story.category}
            </span>
            <span className="text-[11px] font-medium text-slate-500">{formatDate(story.createdAt)}</span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
            {story.title}
          </h3>

          <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
            {story.excerpt || story.content.substring(0, 150)}
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 pb-5 pt-4">
        <Link
          to={`/profile/${story.author?._id || story.author?.id}`}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 transition hover:border-blue-200 hover:bg-blue-50"
        >
          <img
            src={story.author?.profileImage || 'https://via.placeholder.com/32'}
            alt={story.author?.username}
            className="h-7 w-7 rounded-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/32/cccccc/666666?text=?';
            }}
          />
          <span className="text-xs font-medium text-slate-700">
            {story.author?.firstName} {story.author?.lastName}
          </span>
        </Link>

        <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{story.views || 0}</span>
        </div>
      </div>
    </article>
  );
}

export default StoryCard;