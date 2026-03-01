const { AppError } = require('../../../shared/middleware/errorHandler');
const { verifyToken } = require('../services/tokenService');
// const prisma = require('../../../config/prismaClient');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('🔐 Auth Middleware - Authorization header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access token is required', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token, 'access');
    req.user = decoded;
    console.log('✅ Auth Middleware - User set:', { id: decoded.userId, email: decoded.email });
    next();
  } catch (error) {
    console.log('❌ Auth Middleware - Token verification failed:', error.message);
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
