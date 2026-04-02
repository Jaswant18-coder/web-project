import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/axios';

const MovieCard = ({ movie }) => {
  const posterUrl = getImageUrl(movie.poster_path);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  return (
    <Link to={`/movie/${movie.id}`} className="group">
      <div className="card transform hover:scale-105 transition-transform duration-200">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-movie.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center space-x-2">
                {movie.vote_average > 0 && (
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-text-primary truncate group-hover:text-accent-green transition-colors">
            {movie.title}
          </h3>
          <p className="text-sm text-text-secondary">{releaseYear}</p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
