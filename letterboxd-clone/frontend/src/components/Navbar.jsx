import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-darker border-b border-primary-light">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-accent-green">
              Letterboxd
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-text-secondary hover:text-text-primary transition-colors">
                Home
              </Link>
              <Link to="/search" className="text-text-secondary hover:text-text-primary transition-colors">
                Explore
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-green"
              aria-label="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <form onSubmit={handleSearch} className="hidden md:block">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-primary-light px-4 py-2 rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-green w-64"
              />
            </form>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary-light hover:bg-red-600 text-[#ffffff] px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-accent-green hover:bg-green-600 text-[#ffffff] px-4 py-2 rounded-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-4 md:hidden">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-primary-light px-4 py-2 rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
