import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === to
          ? 'text-primary'
          : 'text-gray-600 hover:text-primary'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">Travel Story</span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navLink('/', 'Home')}
              {navLink('/contact', 'Contact')}
              {isAuthenticated && (
                <>
                  {navLink('/create', 'Write Story')}
                  {navLink('/saved', 'Saved')}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 text-sm focus:outline-none"
                >
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden sm:block text-gray-700">{user?.username}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                    <Link
                      to={`/profile/${user?._id}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Saved Stories
                    </Link>
                    <Link
                      to="/create"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Write Story
                    </Link>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden ml-3 p-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLink('/', 'Home')}
            {navLink('/contact', 'Contact')}
            {isAuthenticated && (
              <>
                {navLink('/create', 'Write Story')}
                {navLink('/saved', 'Saved')}
                <Link
                  to={`/profile/${user?._id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-primary"
                >
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;