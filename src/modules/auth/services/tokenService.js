
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const { AppError } = require('../../../shared/middleware/errorHandler');

const generateAccessToken = (payload, expiresIn) => {
  return jwt.sign(
    payload, 
    config.jwt.accesssecret, 
    {
      expiresIn: expiresIn || config.jwt.accessExpiresIn,
    }
  );
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshsecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

const verifyToken = (token, type = 'access') => {
  const secret =
    type === 'refresh'
      ? config.jwt.refreshsecret
      : config.jwt.accesssecret;

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401);
    }
    throw new AppError('Invalid token', 401);
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
