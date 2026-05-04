// Middleware to authorize specific roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route.` 
            });
        }
        next();
    };
};

const authorizeStudent = authorizeRoles('student');
const authorizeTeacher = authorizeRoles('teacher');

module.exports = { authorizeRoles, authorizeStudent, authorizeTeacher };
