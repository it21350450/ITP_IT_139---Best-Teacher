import React from 'react';
import StarRating from './StarRating';

const ReviewCard = ({ review }) => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <img
                        src={review.studentId?.profilePicture || 'https://via.placeholder.com/40'}
                        alt={review.studentId?.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-50"
                    />
                    <div>
                        <h4 className="font-bold text-gray-800">{review.studentId?.name || 'Anonymous'}</h4>
                        <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="text-gray-600 leading-relaxed italic">
                "{review.comment}"
            </p>
        </div>
    );
};

export default ReviewCard;
