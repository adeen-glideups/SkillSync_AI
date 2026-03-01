const { AppError } = require('../../../shared/middleware/errorHandler');
const { verifyToken } = require('../services/tokenService');
// const prisma = require('../../../config/prismaClient');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access token is required', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token, 'access');
    req.user = decoded;
    // const user= await prisma.user.findUnique({
    //   where: { id: decoded.id },
    // });
    // if (!user || user.isDeleted) {
    //   return next(new AppError('User not found', 404));
    // }
    next();
  } catch (error) {
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
