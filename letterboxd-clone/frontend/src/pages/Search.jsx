import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import MovieCard from '../components/MovieCard';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [defaultMovies, setDefaultMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [debugError, setDebugError] = useState(null);

  const normalizeResults = (response) => {
    console.log('API RESPONSE:', response);
    const payload = response?.data?.results ?? response?.data ?? [];
    console.log('PAYLOAD:', payload);
    const result = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
        ? payload.results
        : [];
    console.log('NORMALIZED:', result);
    return result;
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    } else {
      setSearched(false);
      loadDefaultMovies();
    }
  }, [searchParams]);

  const loadDefaultMovies = async () => {
    try {
      setLoading(true);
      setDebugError(null);
      const response = await axiosInstance.get('/movies/popular/');
      const movies = normalizeResults(response);
      setDefaultMovies(movies.slice(0, 12));
    } catch (error) {
      console.error('Default movies error:', error);
      setDebugError(error.message || String(error));
      setDefaultMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setDebugError(null);

    try {
      const response = await axiosInstance.get(`/movies/search/?q=${encodeURIComponent(searchQuery)}`);
      setResults(normalizeResults(response));
    } catch (error) {
      console.error('Search error:', error);
      try {
        const fallbackResponse = await axiosInstance.get('/movies/popular/');
        setResults(normalizeResults(fallbackResponse));
      } catch (fallbackError) {
        console.error('Search fallback error:', fallbackError);
        setDebugError(fallbackError.message || String(fallbackError));
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {debugError && (
        <div className="bg-red-500 text-[#ffffff] p-4 mb-8 rounded">
          <h2 className="font-bold">Error Loading Data:</h2>
          <p>{debugError}</p>
        </div>
      )}
      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-8 text-center">Search Movies</h1>
        
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter movie title..."
            className="flex-1 input-field"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
            <p className="text-text-secondary">Searching...</p>
          </div>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">
            No movies found for "{searchParams.get('q')}". Try a different search.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-text-secondary mb-6">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchParams.get('q')}"
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {!loading && !searched && (
        <div>
          {defaultMovies.length > 0 ? (
            <div>
              <p className="text-text-secondary mb-6">Popular movies</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {defaultMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">
                Enter a movie title to start searching
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
