import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storyAPI } from '../services/api';
import StoryCard from '../components/StoryCard';
import FilterSidebar from '../components/FilterSidebar';

function SearchStories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const queryParams = {
    q: searchParams.get('q') || '',
    destination: searchParams.get('destination') || '',
    category: searchParams.get('category') || '',
    reachableBy: searchParams.get('reachableBy') || '',
    familyFriendly: searchParams.get('familyFriendly') || '',
    page: parseInt(searchParams.get('page')) || 1
  };

  useEffect(() => {
    fetchStories();
  }, [searchParams]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storyAPI.getStories({
        q: searchParams.get('q'),
        destination: searchParams.get('destination'),
        category: searchParams.get('category'),
        reachableBy: searchParams.get('reachableBy'),
        familyFriendly: searchParams.get('familyFriendly'),
        page: searchParams.get('page') || 1,
        limit: 9
      });
      setStories(response.data.data.stories || []);
      setPagination(response.data.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    if (queryParams.q) params.set('q', queryParams.q);
    if (newFilters.destination) params.set('destination', newFilters.destination);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.reachableBy && newFilters.reachableBy.length > 0) {
      params.set('reachableBy', newFilters.reachableBy.join(','));
    }
    if (newFilters.familyFriendly) params.set('familyFriendly', 'true');
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    if (queryParams.q) params.set('q', queryParams.q);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[28px] border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Discover</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Explore Travel Stories</h1>
        {queryParams.q && (
          <p className="mt-3 text-slate-600">
            Search results for <span className="font-semibold text-slate-900">&quot;{queryParams.q}&quot;</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <FilterSidebar
            filters={queryParams}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : stories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {stories.map(story => (
                  <StoryCard key={story._id} story={story} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        pagination.page === p
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">No stories found</h3>
              <p className="mt-2 text-slate-600">Try adjusting your search or filter criteria.</p>
              <button
                onClick={handleReset}
                className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchStories;
