// shared/constants/joiErrors.js
const ERROR_CODES = require("./errorCodes");

/**
 * Map Joi error types to friendly messages and error codes.
 * Add more mappings as you need.
 */
const joiErrorMap = {
  "string.email": {
    message: "Invalid email format",
    error_code: ERROR_CODES.INVALID_INPUT,
  },

  "any.required": {
    message: "Required field missing",
    error_code: ERROR_CODES.REQUIRED_FIELDS_MISSING,
  },

  "string.min": {
    message: "Value is too short",
    error_code: ERROR_CODES.INVALID_INPUT,
  },

  "string.max": {
    message: "Value is too long",
    error_code: ERROR_CODES.INVALID_INPUT,
  },

  "string.length": {
    message: "Invalid length",
    error_code: ERROR_CODES.INVALID_INPUT,
  },

  // "any.only": {
  //   message: "Invalid value selected",
  //   error_code: ERROR_CODES.INVALID_INPUT,
  // },

  // "array.base": {
  //   message: "Invalid array format",
  //   error_code: ERROR_CODES.INVALID_INPUT,
  // },
};

module.exports = joiErrorMap;
