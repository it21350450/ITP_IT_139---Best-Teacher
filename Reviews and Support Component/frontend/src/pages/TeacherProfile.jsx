import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import reviewService from '../services/reviewService';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';

const TeacherProfile = () => {
    const { id } = useParams();
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const reviewsData = await reviewService.getTeacherReviews(id);
                const summaryData = await reviewService.getTeacherSummary(id);
                setReviews(reviewsData);
                setSummary(summaryData);
            } catch (error) {
                console.error('Error fetching teacher data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header / Summary Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-10 text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Teacher Reviews</h1>
                        <p className="text-blue-100 opacity-90">Honest feedback from our student community</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center">
                        <div className="text-5xl font-extrabold mb-1">
                            {summary.averageRating.toFixed(1)}
                        </div>
                        <StarRating rating={summary.averageRating} size="md" />
                        <div className="text-xs mt-2 uppercase tracking-widest opacity-80 font-semibold">
                            {summary.totalReviews} Reviews
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Form (Only for Students) */}
            <ReviewForm teacherId={id} onReviewSubmitted={() => {
                // Refresh data to show new review and updated average
                window.location.reload(); 
            }} />

            {/* Review List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Latest Reviews</h2>
                    <div className="text-sm text-gray-500">Sorted by newest first</div>
                </div>
                
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <ReviewCard key={review._id} review={review} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="text-4xl mb-4">⭐</div>
                        <h3 className="text-lg font-medium text-gray-600">No reviews yet</h3>
                        <p className="text-gray-400">Be the first to share your experience!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherProfile;
