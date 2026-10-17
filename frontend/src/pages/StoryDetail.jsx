import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storyAPI, commentAPI, userAPI } from '../services/api';
import ImageGallery from '../components/ImageGallery';

function StoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [authorInfo, setAuthorInfo] = useState(null);

  useEffect(() => {
    if (id) {
      fetchStory();
    }
  }, [id]);

  useEffect(() => {
    if (!story || story._id !== id) return undefined;

    let active = true;
    const timer = setTimeout(() => {
      storyAPI.countView(id)
        .then((response) => {
          if (active) setViewsCount(response.data.data.views);
        })
        .catch((error) => {
          console.error('Error counting story view:', error);
        });
    }, 10_000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id, story?._id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getStory(id);
      const storyData = response.data.data.story;
      setStory(storyData);
      setViewsCount(storyData.views || 0);
      setLikesCount(storyData.likesCount || 0);
      setIsLiked(Boolean(user && storyData.likes?.some((likeId) => likeId?.toString() === user.id)));
      setBookmarksCount(storyData.bookmarksCount || 0);
      setIsBookmarked(Boolean(user && storyData.bookmarks?.some((bookmarkId) => bookmarkId?.toString() === user.id)));
      setAuthorInfo(storyData.author);
      fetchComments();
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(id);
      setComments(response.data.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await storyAPI.toggleLike(id);
      setIsLiked(response.data.data.isLiked);
      setLikesCount(response.data.data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await storyAPI.toggleBookmark(id);
      setIsBookmarked(response.data.data.isBookmarked);
      setBookmarksCount(prev => response.data.data.isBookmarked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const commentData = {
        storyId: id,
        content: commentText
      };
      const response = await commentAPI.createComment(commentData);
      setComments(prev => [response.data.data.comment, ...prev]);
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await storyAPI.deleteStory(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <article className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {story.coverImage && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="p-8">
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {story.category}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(story.createdAt)}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {story.title}
            </h1>

            {story.excerpt && (
              <p className="text-lg text-gray-600 mb-6">
                {story.excerpt}
              </p>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{bookmarksCount}</span>
              </button>

              <button
                onClick={() => navigate(`/profile/${story.author?._id || story.author?.id}`)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <img
                  src={authorInfo?.profileImage || 'https://via.placeholder.com/40'}
                  alt={authorInfo?.username}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/40/cccccc/666666?text=?';
                  }}
                />
                <span className="font-medium">{authorInfo?.firstName} {authorInfo?.lastName}</span>
              </button>

              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7 1.474 4.057-4.806 7-9.542 7-4.736 0-8.537-2.975-9.542-7" />
                </svg>
                <span>{viewsCount} views</span>
              </div>
            </div>
          </header>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {story.content}
            </p>
          </div>

          <ImageGallery coverImage={story.coverImage} images={story.images} />

          {(story.location?.country || story.location?.city) && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">
                {story.location.city && `${story.location.city}, `}
                {story.location.country}
              </p>
            </div>
          )}

          {(story.reachableBy?.length > 0 || story.familyFriendly) && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Travel Details</h3>
              <div className="space-y-2">
                {story.reachableBy?.length > 0 && (
                  <div>
                    <span className="font-medium">Reachable By:</span> {story.reachableBy.join(', ')}
                  </div>
                )}
                {story.familyFriendly && (
                  <div>
                    <span className="font-medium">Family Friendly:</span> Yes
                    {story.familyFriendlyNote && (
                      <p className="text-sm text-gray-600 mt-1 ml-4">
                        {story.familyFriendlyNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {story.tags?.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <footer className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={authorInfo?.profileImage || 'https://via.placeholder.com/40'}
                  alt={authorInfo?.username}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/40/cccccc/666666?text=?'
                  }}
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {authorInfo?.firstName} {authorInfo?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">@{authorInfo?.username}</p>
                </div>
              </div>

              {user && authorInfo && (authorInfo._id === user.id || authorInfo._id?.toString() === user.id) && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/edit/${id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    Edit Story
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    Delete Story
                  </button>
                </div>
              )}
            </div>
          </footer>
        </div>
      </article>

      <section className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex space-x-4">
              <img
                src={comment.author?.profileImage || 'https://via.placeholder.com/40'}
                alt={comment.author?.username}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/40/cccccc/666666?text=?'
                }}
              />
              <div className="flex-grow">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Be the first to comment!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default StoryDetail;