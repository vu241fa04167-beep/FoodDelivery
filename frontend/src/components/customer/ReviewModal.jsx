import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { api } from '../../services/api.js';

export default function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api('/orders/review', {
        method: 'POST',
        body: {
          orderId: order._id,
          rating,
          comment: comment.trim()
        }
      });
      onReviewSubmitted('Review submitted successfully! Thank you for your feedback.');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e7e9e6]">
        <div className="flex items-center justify-between pb-3 border-b border-[#e7e9e6]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#17211d]">Rate Your Meal</h3>
            <p className="text-xs text-[#66706b]">{order.restaurant?.name || 'Local Kitchen'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66706b] hover:text-[#17211d] hover:bg-[#f7f6f1] transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Star selector */}
          <div className="text-center">
            <p className="text-xs font-semibold text-[#66706b] mb-2">How was your culinary experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition hover:scale-110 active:scale-95"
                    aria-label={`${star} star`}
                  >
                    <Star
                      size={26}
                      className={filled ? 'text-amber-500 fill-amber-500' : 'text-[#e7e9e6]'}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs font-bold text-[#17211d]">
              {rating === 5 && 'Outstanding! Flawless dish.'}
              {rating === 4 && 'Very delicious, enjoyed it!'}
              {rating === 3 && 'Good meal, average experience.'}
              {rating === 2 && 'Needs improvement.'}
              {rating === 1 && 'Disappointing meal.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17211d] mb-1">
              Your Review (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you loved about the flavors, presentation, or portion..."
              className="w-full rounded-xl border border-[#e7e9e6] bg-[#fbfaf7] p-3 text-sm text-[#17211d] outline-none focus:border-[#195c45] focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#195c45] py-2.5 text-sm font-semibold text-white hover:bg-[#124534] transition disabled:opacity-60 shadow-2xs"
          >
            {submitting ? 'Submitting…' : 'Post Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
