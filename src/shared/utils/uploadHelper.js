const multer = require("multer");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const { AppError } = require("../middleware/errorHandler");
const ERROR_CODES = require("../constants/errorCodes");
const config = require("../../config");

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Use memory storage for serverless compatibility (Vercel)
const memoryStorage = multer.memoryStorage();

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

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Folder path in Cloudinary (e.g., 'profile', 'resumes')
 * @param {string} resourceType - 'image' or 'raw' (for non-image files like PDF/DOCX)
 * @returns {Promise<string>} - Public URL of uploaded file
 */
const uploadToCloudinary = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `skillsync/${folder}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} fileUrl - Public URL of the file to delete
 */
const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.includes("cloudinary.com")) return;

    // Extract public_id from URL
    const urlParts = fileUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex === -1) return;

    // Get everything after 'upload/v{version}/'
    const publicIdWithExt = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // Remove extension

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error.message);
  }
};

// Middleware wrapper to handle multer errors and upload to Cloudinary
const handleMulterError = (uploadFunction, folder, resourceType = "image") => {
  return (req, res, next) => {
    uploadFunction(req, res, async (err) => {
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

      // If file exists, upload to Cloudinary
      if (req.file && req.file.buffer) {
        try {
          const publicUrl = await uploadToCloudinary(
            req.file.buffer,
            folder,
            resourceType
          );

          // Attach the public URL to the file object
          req.file.cloudinaryUrl = publicUrl;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return next(
            new AppError(
              "Failed to upload file to storage",
              500,
              ERROR_CODES.FILE_UPLOAD_ERROR
            )
          );
        }
      }

      next();
    });
  };
};

// Multer config for profile images
const profileImageUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: imageFilter,
}).single("profileImage");

// Multer config for resumes
const resumeUploadMulter = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: resumeFilter,
}).single("resume");

// Export
module.exports = {
  uploadProfileImage: handleMulterError(profileImageUpload, "profile", "image"),
  uploadResume: handleMulterError(resumeUploadMulter, "resumes", "raw"),
  uploadToCloudinary,
  deleteFromCloudinary,
};
