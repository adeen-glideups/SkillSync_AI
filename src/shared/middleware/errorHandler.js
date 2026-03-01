const ERROR_CODES = require("../constants/errorCodes");

class AppError extends Error {
  constructor(message, statusCode = 400, errorCode = ERROR_CODES.INVALID_INPUT) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, ERROR_CODES.INTERNAL_SERVER_ERROR));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;

  if (err.code === "P2002") {
    statusCode = 409;
    message = "A record with this value already exists";
    errorCode = ERROR_CODES.EMAIL_ALREADY_EXISTS; 
    if (err.meta && err.meta.target && Array.isArray(err.meta.target)) {
      const target = err.meta.target[0];
      if (target === "email") errorCode = ERROR_CODES.EMAIL_ALREADY_EXISTS;
      if (target === "phone") errorCode = ERROR_CODES.PHONE_ALREADY_EXISTS;
      if (target === "taxId") errorCode = ERROR_CODES.TAX_ID_EXISTS;
    }
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
    errorCode = ERROR_CODES.RESTAURANT_NOT_FOUND;
  }

  if (err.name === "JsonWebTokenError" || errorCode === ERROR_CODES.INVALID_TOKEN) {
    statusCode = 401;
    errorCode = ERROR_CODES.INVALID_TOKEN;
    message = err.message || "Invalid token";
  }

  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error_code: errorCode,
  });
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
