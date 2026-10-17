import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setDashboard(response.data.data);
      } catch (error) {
        console.error('Failed to load admin dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Users</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalUsers || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Stories</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalStories || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Comments</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalComments || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Unverified</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.unverifiedUsers || 0}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent users</h2>
          <div className="mt-4 space-y-3">
            {(dashboard?.recentUsers || []).map((user) => (
              <div key={user._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-800">{user.username}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {user.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Latest stories</h2>
          <div className="mt-4 space-y-3">
            {(dashboard?.recentStories || []).map((story) => (
              <div key={story._id} className="rounded-xl bg-slate-50 p-3">
                <p className="font-semibold text-slate-800">{story.title}</p>
                <p className="text-sm text-slate-500">By {story.author?.username || 'Unknown author'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
