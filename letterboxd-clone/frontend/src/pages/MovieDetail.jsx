import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance, { getImageUrl } from '../utils/axios';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import MovieCard from '../components/MovieCard';

const MovieDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadMovieData();
  }, [id, user]);

  const loadMovieData = async () => {
    try {
      setLoading(true);

      const [movieRes, reviewsRes, similarRes] = await Promise.all([
        axiosInstance.get(`/movies/${id}/`),
        axiosInstance.get(`/reviews/?movie_id=${id}`),
        axiosInstance.get(`/recommendations/similar/${id}/`),
      ]);

      setMovie(movieRes.data);
      const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []);
      setReviews(reviewsData);
      setSimilarMovies(similarRes.data.results?.slice(0, 6) || []);

      if (user) {
        const existingReview = reviewsData.find((r) => r.user.id === user.id);
        setUserReview(existingReview);

        try {
          const watchedRes = await axiosInstance.get(`/reviews/watched/?username=${user.username}`);
          const watchedData = Array.isArray(watchedRes.data) ? watchedRes.data : (watchedRes.data.results || []);
          const watched = watchedData.find((w) => w.movie_id === parseInt(id));
          setIsWatched(!!watched);
        } catch (error) {
          console.error('Error checking watched status:', error);
        }
      }
    } catch (error) {
      console.error('Error loading movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    setReviewLoading(true);
    try {
      if (userReview) {
        await axiosInstance.patch(`/reviews/${userReview.id}/`, reviewData);
      } else {
        await axiosInstance.post('/reviews/', {
          ...reviewData,
          movie_id: parseInt(id),
        });
      }
      
      await loadMovieData();
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      alert(`Failed to submit review. Details: ${errorMsg}`);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axiosInstance.delete(`/reviews/${reviewId}/`);
      await loadMovieData();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review.');
    }
  };

  const handleLikeReview = async (reviewId) => {
    try {
      await axiosInstance.post(`/reviews/${reviewId}/like/`);
      await loadMovieData();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleUnlikeReview = async (reviewId) => {
    try {
      await axiosInstance.delete(`/reviews/${reviewId}/like/`);
      await loadMovieData();
    } catch (error) {
      console.error('Error unliking review:', error);
    }
  };

  const handleMarkAsWatched = async () => {
    try {
      await axiosInstance.post('/reviews/watched/', {
        movie_id: parseInt(id),
        watched_date: new Date().toISOString().split('T')[0],
      });
      setIsWatched(true);
    } catch (error) {
      console.error('Error marking as watched:', error);
      alert('Failed to mark as watched.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading movie details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-text-secondary text-lg">Movie not found</p>
        </div>
      </div>
    );
  }

  const backdropUrl = getImageUrl(movie.backdrop_path, 'w1280');
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  return (
    <div>
      <div
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(20, 24, 28, 0.3), rgba(20, 24, 28, 1)), url(${backdropUrl})`,
        }}
      >
        <div className="container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-end space-x-6">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-48 h-72 object-cover rounded-lg shadow-2xl"
            />
            <div className="pb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
                {movie.title}
              </h1>
              <div className="flex items-center space-x-4 text-text-secondary">
                <span>{releaseYear}</span>
                {movie.runtime && <span>{movie.runtime} min</span>}
                {movie.vote_average > 0 && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Overview</h2>
              <p className="text-text-secondary leading-relaxed">{movie.overview}</p>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-4 py-2 bg-primary-light rounded-full text-sm text-text-secondary"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">Actions</h3>
              {user ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="w-full btn-primary"
                  >
                    {userReview ? 'Edit Review' : 'Write a Review'}
                  </button>
                  {!isWatched && (
                    <button
                      onClick={handleMarkAsWatched}
                      className="w-full btn-secondary"
                    >
                      Mark as Watched
                    </button>
                  )}
                  {isWatched && (
                    <div className="text-center py-2 text-accent-green">
                      ✓ Watched
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-text-secondary text-sm">
                  Login to review and track this movie
                </p>
              )}
            </div>
          </div>
        </div>

        {showReviewForm && user && (
          <div className="mb-12">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {userReview ? 'Edit Your Review' : 'Write a Review'}
              </h2>
              <ReviewForm
                onSubmit={handleReviewSubmit}
                initialData={userReview}
                loading={reviewLoading}
              />
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Reviews ({reviews.length})
          </h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onLike={handleLikeReview}
                  onUnlike={handleUnlikeReview}
                  onDelete={handleReviewDelete}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">
              No reviews yet. Be the first to review this movie!
            </p>
          )}
        </div>

        {similarMovies.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Similar Movies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {similarMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
