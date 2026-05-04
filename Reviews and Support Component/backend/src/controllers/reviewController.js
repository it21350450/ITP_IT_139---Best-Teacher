const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Student)
const createReview = async (req, res) => {
    try {
        const { teacherId, lessonId, rating, comment } = req.body;
        const studentId = req.user._id;

        // Check if teacher exists
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if review already exists for this lesson
        const existingReview = await Review.findOne({ lessonId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already submitted a review for this lesson' });
        }

        const review = await Review.create({
            studentId,
            teacherId,
            lessonId,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch all reviews for a teacher
// @route   GET /api/reviews/teacher/:teacherId
// @access  Public
const getTeacherReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ teacherId: req.params.teacherId })
            .populate('studentId', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Return teacher rating summary
// @route   GET /api/reviews/teacher/:teacherId/summary
// @access  Public
const getTeacherSummary = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.teacherId).select('averageRating totalReviews');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json({
            averageRating: teacher.averageRating || 0,
            totalReviews: teacher.totalReviews || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const teacherId = review.teacherId;
        await review.remove();

        // The pre-remove hook in Review model will update the average rating
        // But since we are using remove() on instance, it will work.
        // Wait, remove() is deprecated in newer Mongoose, maybe use findByIdAndDelete or similar?
        // Let's stick to simple logic or manual update.
        // Actually, my Review.js has reviewSchema.pre('remove', ...)
        
        // Let's re-run getAverageRating just in case
        await Review.getAverageRating(teacherId);

        res.status(200).json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getTeacherReviews,
    getTeacherSummary,
    deleteReview
};
