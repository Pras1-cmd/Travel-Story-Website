import { Link } from 'react-router-dom';
import { useState } from 'react';
import { storyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StoryCard({ story, onDelete }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(story.likes?.includes(user?.id) || false);
  const [likesCount, setLikesCount] = useState(story.likesCount || 0);
  const [loading, setLoading] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await storyAPI.likeStory(story._id);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Like error:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this story?')) return;

    setLoading(true);
    try {
      await storyAPI.deleteStory(story._id);
      if (onDelete) onDelete(story._id);
    } catch (error) {
      console.error('Delete error:', error);
    }
    setLoading(false);
  };

  const coverImage = story.coverImage || story.images?.[0]?.url || 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link to={`/story/${story._id}`} className="block overflow-hidden h-48 bg-gray-200">
        <img
          src={coverImage}
          alt={story.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-medium rounded-full capitalize">
            {story.category}
          </span>
          <span className="text-gray-500 text-sm">{story.views || 0} views</span>
        </div>

        {/* Title */}
        <Link to={`/story/${story._id}`} className="block mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-primary transition-colors">
            {story.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {story.excerpt || story.content?.substring(0, 100)}
        </p>

        {/* Location */}
        {story.location && (
          <p className="text-gray-500 text-sm mb-3">
            📍 {story.location.city}, {story.location.country}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <Link
            to={`/profile/${story.author._id}`}
            className="flex items-center space-x-2 hover:opacity-80"
          >
            <img
              src={story.author.profileImage || 'https://via.placeholder.com/40'}
              alt={story.author.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700 hover:text-primary">
              {story.author.username}
            </span>
          </Link>
          <span className="text-xs text-gray-500">
            {new Date(story.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            disabled={loading || !user}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              isLiked
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>❤️</span>
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <Link
            to={`/story/${story._id}`}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Read More
          </Link>

          {user?.id === story.author._id && (
            <div className="flex space-x-2">
              <Link
                to={`/edit/${story._id}`}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryCard;
