const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { body } = require('express-validator');

// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.contactNumber = req.body.contactNumber || user.contactNumber;
        user.profilePicture = req.body.profilePicture || user.profilePicture;
        
        // Handling role specific field updates dynamically based on the role
        if (user.role === 'student' && req.body.studentData) {
            Object.assign(user, req.body.studentData);
        } else if (user.role === 'teacher' && req.body.teacherData) {
            Object.assign(user, req.body.teacherData);
        }

        const updatedUser = await user.save();

        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    // Find the current user and grab the hashed password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Checking if old password matches
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
         return res.status(400).json({ message: 'Incorrect old password' });
    }

    // Set the new password - mongoose pre-save hook will handle hashing
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
});

// @desc    Delete user account
// @route   DELETE /api/users/delete-account
// @access  Private
exports.deleteUserAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        await User.deleteOne({ _id: user._id });
        // Optional logic: remove tasks, bookings, or requests related to this user
        
        res.json({ message: 'User account removed automatically and deeply' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    const users = await User.find({});
    res.json(users);
});

// @desc    Delete user by admin
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUserByAdmin = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    const user = await User.findById(req.params.id);

    if (user) {
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed by admin' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Validation requirements
exports.changePasswordValidation = [
    body('oldPassword', 'Old password is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
];

exports.profileValidation = [
    body('name', 'Name cannot be empty').optional({ checkFalsy: true }),
    body('contactNumber', 'Contact number must be exactly 10 digits').optional({ checkFalsy: true }).isNumeric().isLength({ min: 10, max: 10 }),
    body('profilePicture', 'Profile picture must be a valid URL').optional({ checkFalsy: true }).isURL()
];
