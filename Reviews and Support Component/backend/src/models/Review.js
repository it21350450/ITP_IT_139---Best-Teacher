const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessonId: {
        type: String,
        // Simulation: optional for testing
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Static method to get average rating and update Teacher User model
reviewSchema.statics.getAverageRating = async function(teacherId) {
    const obj = await this.aggregate([
        {
            $match: { teacherId: teacherId }
        },
        {
            $group: {
                _id: '$teacherId',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        const User = mongoose.model('User');
        if (obj.length > 0) {
            await User.findByIdAndUpdate(teacherId, {
                averageRating: Math.round(obj[0].averageRating * 10) / 10,
                totalReviews: obj[0].totalReviews
            });
        } else {
            await User.findByIdAndUpdate(teacherId, {
                averageRating: 0,
                totalReviews: 0
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.teacherId);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.teacherId);
});

module.exports = mongoose.model('Review', reviewSchema);
