import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance, { getImageUrl } from '../utils/axios';
import MovieCard from '../components/MovieCard';
import ReviewCard from '../components/ReviewCard';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('watched');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !username || (currentUser && currentUser.username === username);
  const displayUsername = username || currentUser?.username;

  useEffect(() => {
    if (displayUsername) {
      loadProfileData();
    }
  }, [displayUsername]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      const [profileRes, watchedRes] = await Promise.all([
        isOwnProfile
          ? axiosInstance.get('/auth/profile/')
          : axiosInstance.get(`/auth/users/${displayUsername}/`),
        axiosInstance.get(`/reviews/watched/?username=${displayUsername}`),
      ]);

      setProfile(profileRes.data);

      const watchedData = Array.isArray(watchedRes.data) ? watchedRes.data : (watchedRes.data.results || []);

      const watchedWithDetails = await Promise.all(
        watchedData.map(async (watched) => {
          try {
            const movieRes = await axiosInstance.get(`/movies/${watched.movie_id}/`);
            return {
              ...watched,
              movie: movieRes.data,
            };
          } catch (error) {
            console.error(`Error loading movie ${watched.movie_id}:`, error);
            return null;
          }
        })
      );

      setWatchedMovies(watchedWithDetails.filter((m) => m !== null));

      try {
        const reviewsRes = await axiosInstance.get(`/reviews/?user_id=${profileRes.data.id}`);
        const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    try {
      await axiosInstance.post(`/reviews/${reviewId}/like/`);
      await loadProfileData();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleUnlikeReview = async (reviewId) => {
    try {
      await axiosInstance.delete(`/reviews/${reviewId}/like/`);
      await loadProfileData();
    } catch (error) {
      console.error('Error unliking review:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axiosInstance.delete(`/reviews/${reviewId}/`);
      await loadProfileData();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-text-secondary text-lg">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-accent-green">
              {profile.username[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">{profile.username}</h1>
            <p className="text-text-secondary">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {profile.bio && (
          <p className="text-text-secondary max-w-2xl">{profile.bio}</p>
        )}

        <div className="flex space-x-8 mt-6">
          <div>
            <p className="text-3xl font-bold text-text-primary">{watchedMovies.length}</p>
            <p className="text-text-secondary text-sm">Films Watched</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-text-primary">{reviews.length}</p>
            <p className="text-text-secondary text-sm">Reviews</p>
          </div>
        </div>
      </div>

      <div className="border-b border-primary-light mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('watched')}
            className={`pb-4 px-2 transition-colors ${
              activeTab === 'watched'
                ? 'text-text-primary border-b-2 border-accent-green'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Watched ({watchedMovies.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-2 transition-colors ${
              activeTab === 'reviews'
                ? 'text-text-primary border-b-2 border-accent-green'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {activeTab === 'watched' && (
        <div>
          {watchedMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {watchedMovies.map((watched) => (
                <MovieCard key={watched.id} movie={watched.movie} />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-12">
              No watched movies yet. Start tracking your movie journey!
            </p>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onLike={handleLikeReview}
                  onUnlike={handleUnlikeReview}
                  onDelete={isOwnProfile ? handleDeleteReview : null}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-12">
              No reviews yet. Start reviewing movies you've watched!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
