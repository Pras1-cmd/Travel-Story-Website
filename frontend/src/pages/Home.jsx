import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storyAPI } from '../services/api';
import StoryCard from '../components/StoryCard';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const categories = ['adventure', 'culture', 'food', 'nature', 'city', 'budget', 'luxury', 'solo', 'family'];

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 9 };
        if (category) params.category = category;

        const response = await storyAPI.getStories(params);
        setStories(response.data.data.stories || []);
        setError(null);
      } catch (err) {
        setError('Failed to load stories');
        setStories([]);
      }
      setLoading(false);
    };

    fetchStories();
  }, [category, page]);

  const handleStoryDelete = (deletedId) => {
    setStories(prev => prev.filter(story => story._id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing Travel Stories
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mb-8">
            Share your adventures and explore destinations through the experiences
            of fellow travelers from around the world.
          </p>
          {user ? (
            <Link
              to="/create"
              className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-md"
            >
              + Create Your Story
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-md"
            >
              Start Sharing Your Story
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setCategory('');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                category === ''
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  category === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(item => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-4">
                  <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                  <div className="h-4 bg-gray-200 w-full rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Stories Found</h3>
            <p className="text-gray-600 mb-6">
              {category
                ? `No stories in the ${category} category yet. Be the first to share!`
                : 'No stories yet. Be the first to share your adventure!'}
            </p>
            {user && (
              <Link
                to="/create"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create a Story
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {stories.map(story => (
                <StoryCard
                  key={story._id}
                  story={story}
                  onDelete={handleStoryDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-gray-700 font-medium">
                Page {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={stories.length < 9}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
