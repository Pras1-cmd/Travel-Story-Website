import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storyAPI } from '../services/api';
import StoryCard from '../components/StoryCard';

function Home() {
  const [trendingStories, setTrendingStories] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      // Fetch trending stories
      const trendingResponse = await storyAPI.getTrending({ limit: 6 });
      setTrendingStories(trendingResponse.data.data.stories || []);

      // Fetch recent stories
      const recentResponse = await storyAPI.getStories({ limit: 6 });
      setRecentStories(recentResponse.data.data.stories || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Travel Stories
          </h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mt-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="mb-10 overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20">
        <div className="grid gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-12">
          <div className="text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-[0.12em] text-blue-50 uppercase">
              Travel • Stories • Discover
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Discover stories worth taking the next trip for.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-blue-50/90 md:text-lg">
              Share your adventures, explore amazing places, and get inspired by real travel experiences from across the world.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-sky-900/10 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Start Sharing
              </Link>
              <Link
                to="/stories"
                className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Explore Stories
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-3xl font-black text-white">120+</div>
              <div className="mt-1 text-sm text-blue-100">Travel stories shared</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-3xl font-black text-white">40+</div>
              <div className="mt-1 text-sm text-blue-100">Cities explored</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:col-span-2 lg:col-span-1 xl:col-span-2">
              <div className="text-sm font-medium uppercase tracking-[0.12em] text-blue-100">Popular this week</div>
              <div className="mt-3 text-xl font-bold text-white">Paris, Kyoto, Bali</div>
            </div>
          </div>
        </div>
      </div>

      {trendingStories.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Trending</p>
              <h2 className="text-2xl font-bold text-slate-900">Popular travel moments</h2>
            </div>
            <Link to="/stories" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">View all</Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trendingStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        </section>
      )}

      {recentStories.length > 0 && (
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-600">Fresh picks</p>
            <h2 className="text-2xl font-bold text-slate-900">Recent stories</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        </section>
      )}

      {trendingStories.length === 0 && recentStories.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">No stories yet</h2>
          <p className="mt-3 text-slate-600">Be the first to share your travel experience.</p>
          <Link
            to="/create"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Create First Story
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
