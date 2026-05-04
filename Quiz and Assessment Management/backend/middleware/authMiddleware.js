const jwt = require('jsonwebtoken');

// Simple Auth Middleware
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  // For Demo/Mock purposes: Bypass JWT verification if it's a mock role token
  if (token && token.startsWith('mock_role_')) {
    const role = token.replace('mock_role_', '');
    req.user = { 
      id: role === 'teacher' ? '65f3a0a1e4b0a1b2c3d4e5f5' : '65f3a1b2e4b0a1b2c3d4e5f6', 
      role 
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based Access Middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this resource` });
    }
    next();
  };
};
