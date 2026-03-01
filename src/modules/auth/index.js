// Auth Module - Public API
// Only expose what other modules need

const router = require('./routes/authRoutes');
const { authenticate, authorize } = require('./middleware/authenticate');
const { verifyToken } = require('./services/tokenService');

module.exports = {
  router,
  authenticate,
  authorize,
  verifyToken
};