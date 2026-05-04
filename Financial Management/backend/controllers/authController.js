const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Get a demo token for a specific role
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res) => {
    const { role } = req.body; // 'student', 'teacher', or 'admin'

    try {
        // Find or create a demo user for this role
        const user = await User.findOneAndUpdate(
            { email: `demo-${role}@example.com` },
            {
                $setOnInsert: {
                    name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                    password: 'hashed_password', // Not used for demo
                    balance: role === 'teacher' ? 500 : 0,
                    totalEarnings: role === 'teacher' ? 1200 : 0
                },
                $set: { role: role } // Ensure the role is correct
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during demo login' });
    }
};

module.exports = { demoLogin };
