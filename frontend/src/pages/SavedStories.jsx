import { useState, useEffect } from 'react';
import { storyAPI } from '../services/api';
import StoryCard from '../components/StoryCard';

function SavedStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedStories();
  }, []);

  const fetchSavedStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getBookmarkedStories();
      setStories(response.data.data.stories || []);
    } catch (error) {
      console.error('Error fetching saved stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Stories</h1>

      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story._id} story={story} onStoryUpdate={fetchSavedStories} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved stories yet</h2>
          <p className="text-gray-600 mb-6">Start exploring and save stories you want to read later!</p>
        </div>
      )}
    </div>
  );
}

export default SavedStories;