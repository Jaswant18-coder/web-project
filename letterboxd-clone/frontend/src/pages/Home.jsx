import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import MovieCard from '../components/MovieCard';

const Home = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    loadMovies();
  }, [user]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setDebugError(null);

      // Fetch sequentially to prevent SQLite database lock errors in backend
      const trendingRes = await axiosInstance.get('/movies/trending/');
      const popularRes = await axiosInstance.get('/movies/popular/');

      console.log('Trending:', trendingRes.data);
      console.log('Popular:', popularRes.data);

      setTrending(trendingRes.data.results?.slice(0, 8) || []);
      setPopular(popularRes.data.results?.slice(0, 12) || []);

      if (user) {
        try {
          const recRes = await axiosInstance.get('/recommendations/');
          const recData = Array.isArray(recRes.data) ? recRes.data : (recRes.data.results || []);
          setRecommendations(recData.slice(0, 8));
        } catch (error) {
          console.error('Error loading recommendations:', error);
        }
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      setDebugError(error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading movies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {debugError && (
        <div className="bg-red-500 text-[#ffffff] p-4 mb-8 rounded">
          <h2 className="font-bold">Error Loading Data:</h2>
          <p>{debugError}</p>
        </div>
      )}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Track films you've watched.
          <br />
          Save those you want to see.
          <br />
          <span className="text-accent-green">Tell your friends what's good.</span>
        </h1>
        {!user && (
          <p className="text-text-secondary text-lg">
            Sign up to get started tracking your movie journey.
          </p>
        )}
      </div>

      {trending.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Trending This Week</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {trending.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {user && recommendations.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Recommended For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Popular Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {popular.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
