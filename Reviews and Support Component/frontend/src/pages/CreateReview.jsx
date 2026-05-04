import React from 'react';
import ReviewForm from '../components/ReviewForm';

const CreateReview = () => {
    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Write a Review</h1>
            <ReviewForm onReviewSubmitted={() => { window.location.href = '/' }} />
        </div>
    );
};

export default CreateReview;
