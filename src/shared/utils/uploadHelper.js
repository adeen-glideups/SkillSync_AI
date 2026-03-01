const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { AppError } = require("../middleware/errorHandler");
const ERROR_CODES = require("../constants/errorCodes");

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
const profileDir = path.join(uploadsDir, "profile");
const resumesDir = path.join(uploadsDir, "resumes");

ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(profileDir);
ensureDirectoryExists(resumesDir);

// File filter - images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Only JPG, JPEG, PNG, and WEBP files are allowed"),
      false
    );
  }
};

// File filter - resume files (PDF and DOCX)
const resumeFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|msword/;
  const extname = /pdf|docx/.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = /pdf|docx|msword/.test(file.mimetype);

  if ((mimetype || extname) && extname) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Only PDF and DOCX files are allowed"),
      false
    );
  }
};

// Middleware wrapper to handle multer errors
const handleMulterError = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError(
              "File size exceeds limit",
              400,
              ERROR_CODES.FILE_TOO_LARGE
            )
          );
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return next(
            new AppError(
              "Too many files uploaded",
              400,
              ERROR_CODES.TOO_MANY_FILES
            )
          );
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            new AppError(
              "Unexpected field in file upload",
              400,
              ERROR_CODES.FILE_UPLOAD_ERROR
            )
          );
        }
        return next(
          new AppError(
            err.message || "File upload error",
            400,
            ERROR_CODES.FILE_UPLOAD_ERROR
          )
        );
      } else if (err) {
        return next(
          new AppError(
            err.message || "File upload failed",
            400,
            ERROR_CODES.FILE_UPLOAD_ERROR
          )
        );
      }

      next();
    });
  };
};

// Storage configuration for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "profile-" + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

const profileImageUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: imageFilter,
}).single("profileImage");

// Storage configuration for resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "resume-" + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: resumeFilter,
}).single("resume");

// Export
module.exports = {
  uploadProfileImage: handleMulterError(profileImageUpload),
  uploadResume: handleMulterError(resumeUpload),
};
