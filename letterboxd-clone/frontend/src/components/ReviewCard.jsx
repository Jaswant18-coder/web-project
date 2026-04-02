import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RatingStars from './RatingStars';

const ReviewCard = ({ review, onLike, onUnlike, onDelete }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const isOwnReview = user && user.id === review.user.id;

  const handleLikeToggle = async () => {
    if (review.is_liked) {
      await onUnlike(review.id);
    } else {
      await onLike(review.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shouldTruncate = review.review_text && review.review_text.length > 300;
  const displayText = isExpanded || !shouldTruncate
    ? review.review_text
    : review.review_text?.substring(0, 300) + '...';

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-accent-green">
              {review.user.username[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-text-primary">{review.user.username}</p>
            <p className="text-sm text-text-secondary">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} readonly size="small" />
      </div>

      {review.review_text && (
        <div className="mb-4">
          <p className="text-text-secondary whitespace-pre-wrap">{displayText}</p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-accent-green hover:text-green-400 text-sm mt-2 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-primary-light">
        <button
          onClick={handleLikeToggle}
          disabled={!user}
          className={`flex items-center space-x-2 transition-colors ${
            review.is_liked ? 'text-red-500' : 'text-text-secondary hover:text-red-500'
          } ${!user && 'cursor-not-allowed opacity-50'}`}
        >
          <svg
            className="w-5 h-5"
            fill={review.is_liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm">{review.likes_count || 0}</span>
        </button>

        {isOwnReview && onDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="text-red-500 hover:text-red-400 text-sm transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
