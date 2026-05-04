const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            let userId;
            if (token.startsWith('mock-jwt-token-')) {
                // Simulation mode: extract role from mock token
                const role = token.replace('mock-jwt-token-', '');
                const mockUsers = {
                    student: '640f1a2b3c4d5e6f7a8b9c01',
                    teacher: '640f1a2b3c4d5e6f7a8b9c02',
                    admin: '640f1a2b3c4d5e6f7a8b9c03'
                };
                userId = mockUsers[role];
            } else {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            }

            req.user = await User.findById(userId).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user ? req.user.role : 'none'} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
