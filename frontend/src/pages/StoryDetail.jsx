import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await storyAPI.getStory(id);
        const storyData = response.data.data.story;
        setStory(storyData);
        setLikesCount(storyData.likesCount || 0);
        setIsLiked(storyData.likes?.includes(user?.id) || false);
      } catch (err) {
        setError('Story not found');
      }
      setLoading(false);
    };

    fetchStory();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      await storyAPI.likeStory(id);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (err) {
      console.error('Like error:', err);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await storyAPI.deleteStory(id);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete story');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error || 'Story not found'}
        </div>
        <Link to="/" className="inline-block mt-4 text-primary hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === story.author._id;
  const coverImage = story.coverImage || story.images?.[0]?.url;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
      >
        ← Back to Stories
      </Link>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Cover Image */}
      {coverImage && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <img
            src={coverImage}
            alt={story.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
      )}

      {/* Title and Meta */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full capitalize">
            {story.category}
          </span>
          <span className="text-gray-500 text-sm">{story.views} views</span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {story.title}
        </h1>

        {/* Location */}
        {story.location && (
          <p className="text-lg text-gray-600 mb-4">
            📍 {story.location.city}, {story.location.country}
          </p>
        )}

        {/* Author Info */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <Link
            to={`/profile/${story.author._id}`}
            className="flex items-center space-x-3 hover:opacity-80"
          >
            <img
              src={story.author.profileImage || 'https://via.placeholder.com/50'}
              alt={story.author.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900 hover:text-primary">
                {story.author.username}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(story.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={actionLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
              <span className="font-medium">{likesCount}</span>
            </button>

            {isAuthor && (
              <div className="flex gap-2">
                <Link
                  to={`/edit/${story._id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Excerpt */}
      {story.excerpt && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <p className="text-lg text-gray-700 italic">{story.excerpt}</p>
        </div>
      )}

      {/* Story Content */}
      <div className="prose max-w-none mb-8">
        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
          {story.content}
        </p>
      </div>

      {/* Tags */}
      {story.tags && story.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {story.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Image Gallery */}
      {story.images && story.images.length > 1 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Photo Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {story.images.map((img, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden shadow-md">
                <img
                  src={img.url}
                  alt={img.caption || `Image ${idx + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform"
                />
                {img.caption && (
                  <p className="text-sm text-gray-600 p-2 bg-gray-50">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {story.author.bio && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-2">About the Author</h3>
          <p className="text-gray-600">{story.author.bio}</p>
        </div>
      )}
    </div>
  );
}

export default StoryDetail;