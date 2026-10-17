import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../SearchBar';

function Navbar() {
  const { user, logout, loading, isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-blue-500/20">
            T
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">TravelStory</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">Home</Link>
          <Link to="/stories" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">Explore</Link>
          <Link to="/contact" className="text-sm font-medium text-slate-600 transition hover:text-blue-600">Contact</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <SearchBar />
          </div>

          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    className="hidden rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 sm:inline-flex"
                  >
                    Create Story
                  </Link>
                  {(user?.isAdmin || user?.role === 'admin') && (
                    <Link to="/admin" className="text-sm font-medium text-slate-700 transition hover:text-blue-600">
                      Admin
                    </Link>
                  )}
                  <Link
                    to={user ? `/profile/${user.id || user._id}` : '/profile'}
                    className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-700 transition hover:text-blue-600">Login</Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:translate-y-[-1px] hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
