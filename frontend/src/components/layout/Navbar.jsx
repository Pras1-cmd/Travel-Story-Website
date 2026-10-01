import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            TravelStory
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Home
            </Link>

            {!loading && (
              <>
                {user ? (
                  <>
                    {/* User logged in - show user menu */}
                    <Link
                      to={`/profile/${user.id}`}
                      className="text-gray-700 hover:text-primary font-medium transition-colors"
                    >
                      {user.username}
                    </Link>
                    <Link
                      to="/create"
                      className="text-gray-700 hover:text-primary font-medium transition-colors"
                    >
                      Create Story
                    </Link>
                    <button
                      onClick={logout}
                      className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* User not logged in - show login/register */}
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-primary font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
