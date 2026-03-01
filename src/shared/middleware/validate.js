const { AppError } = require("./errorHandler");
const joiErrorMap = require("../constants/joiErrors");
const ERROR_CODES = require("../constants/errorCodes");

const validate = (schema) => {
  return (req, res, next) => {
    // Wait for multer to finish
    setTimeout(() => {
      let dataToValidate = { ...req.body };

      // ✅ Trim all string fields safely
      Object.keys(dataToValidate).forEach(key => {
        const value = dataToValidate[key];

        if (typeof value === "string") {
          dataToValidate[key] = value.trim();
        }
      });

      // ✅ Parse JSON strings for complex fields
      const jsonFields = [
        'addresses',
        'location',
        'operatingHours',
        'groupAddons',
        'individualAddons',
        'flavours',
        'extras',
        'deleteFlavourIds',
        'deleteExtraIds',
        'deleteImages',
        'deleteVideos',
        'deleteGroupAddonIds',
        'deleteIndividualAddonIds',
      ];

      jsonFields.forEach(field => {
        if (dataToValidate[field] && typeof dataToValidate[field] === 'string') {
          try {
            dataToValidate[field] = JSON.parse(dataToValidate[field]);
          } catch (e) {
            // Keep as string if parse fails - validation will catch it
          }
        }
      });

      // ✅ Parse comma-separated strings to arrays
      const arrayFields = [
        'categoryIds',
        'dishCategoryIds',
        'tags',
        'dietary',
      ];

      arrayFields.forEach(field => {
        if (dataToValidate[field] && typeof dataToValidate[field] === 'string') {
          if (dataToValidate[field].includes(',')) {
            dataToValidate[field] = dataToValidate[field].split(',').map(item => item.trim());
          }
        }
      });

      // ✅ SAFE type casting only for numeric-only known fields
      if (dataToValidate.nic) {
        const n = Number(dataToValidate.nic);
        if (!isNaN(n)) dataToValidate.nic = n;
      }

      if (dataToValidate.categoryId) {
        const n = Number(dataToValidate.categoryId);
        if (!isNaN(n)) dataToValidate.categoryId = n;
      }

      if (dataToValidate.price) {
        const n = Number(dataToValidate.price);
        if (!isNaN(n)) dataToValidate.price = n;
      }

      // ✅ Convert array of string numbers to array of numbers
      if (Array.isArray(dataToValidate.categoryIds)) {
        dataToValidate.categoryIds = dataToValidate.categoryIds.map(id => {
          const num = Number(id);
          return isNaN(num) ? id : num;
        });
      }

      if (Array.isArray(dataToValidate.dishCategoryIds)) {
        dataToValidate.dishCategoryIds = dataToValidate.dishCategoryIds.map(id => {
          const num = Number(id);
          return isNaN(num) ? id : num;
        });
      }

      // Validate with Joi
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: true,
        stripUnknown: true,
      });

      if (error) {
        const type = error.details?.[0]?.type;
        const mapped = joiErrorMap[type];

        const message =
          mapped?.message || error.details.map(d => d.message).join(", ");

        const errorCode =
          mapped?.error_code || ERROR_CODES.INVALID_INPUT;

        return res.status(400).json({
          success: false,
          message,
          error_code: errorCode,
        });
      }

      req.body = value;
      next();
    }, 0); // Wait for multer to fully populate req.body
  };
};
const validateQuery = (schema) => {
  return (req, res, next) => {
    // Merge params and query for validation
    const data = { ...req.params, ...req.query };

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true, // Auto-convert string numbers to numbers
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      throw new AppError(errorMessage, 400, ERROR_CODES.VALIDATION_ERROR);
    }

    // Update req.query and req.params with validated values
    Object.keys(req.params).forEach(key => {
      if (value[key] !== undefined) {
        req.params[key] = value[key];
      }
    });

    Object.keys(req.query).forEach(key => {
      if (value[key] !== undefined) {
        req.query[key] = value[key];
      }
    });

    next();
  };
};

module.exports = { validate, validateQuery };