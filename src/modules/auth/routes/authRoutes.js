const express = require("express");
const Joi = require("joi");
const { validate } = require("../../../shared/middleware/validate");
const { authenticate } = require("../middleware/authenticate");
const authController = require("../controllers/authController");
const {
  uploadRestaurantImages,
  registerInitialUpload,
  uploadProfileImage, // used for user signup
} = require("../../../shared/utils/uploadHelper");

const router = express.Router();

/* ---------------------------
   VALIDATION SCHEMAS
--------------------------- */

// ✅ Step 1: Signup
const signupSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().trim().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  // profileImage will be handled by multer, so we don't validate it here`
});

// ✅ Step 2: Request OTP
const requestOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  purpose: Joi.string().valid("LOGIN", "VERIFYEMAIL", "VERIFYPHONE", "FORGOTPASSWORD", "UPDATEPASSWORD", "DELETEACCOUNT").required(),
});
const forgotPasswordRequestOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

// ✅ Step 3: Verify OTP
const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().length(6).required(),
  purpose: Joi.string().valid("LOGIN", "VERIFYEMAIL", "FORGOTPASSWORD", "UPDATEPASSWORD", "DELETEACCOUNT").required(),

});
// Login
const loginWithEmailSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
  deviceType: Joi.string().optional(),
  fcmToken: Joi.string().optional(),
});

// Update Password
const updatePasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
});

// Refresh Token
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
const firebaseJoinSchema = Joi.object({
  firebaseToken: Joi.string().required().messages({
    "any.required": "Firebase token is required",
  }),
});
/* ---------------------------
   ✅ NEW FLOW ROUTES
--------------------------- */

// Step 1: Signup (Email + Password)
// use multer middleware to parse form-data including file upload
router.post("/signup", uploadProfileImage, validate(signupSchema), authController.signup);
// Step 2: Request OTP
router.post(
  "/request-otp",
  validate(requestOtpSchema),
  authController.requestOtp
);
router.post(
  "/join",
  validate(firebaseJoinSchema),
  authController.joinWithFirebase
);
// Step 3: Verify OTP
router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  authController.verifyOtp
);
router.post(
  "/forgot-password-request-otp",
  validate(forgotPasswordRequestOtpSchema),
  authController.forgotPasswordRequestOtp

)
// Login
router.post(
  "/login",
  validate(loginWithEmailSchema),
  authController.loginWithEmail
);

// Update Password
router.post(
  "/update-password",
  authenticate,
  validate(updatePasswordSchema),
  authController.updatePassword
);

// Refresh Token
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken
);

// Logout
router.post(
  "/logout",
  validate(refreshTokenSchema),
  authController.logout
);

router.post("/logout-all", authenticate, authController.logoutAll);

// Update profile (name, gender, profileImage)
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  removeProfileImage: Joi.boolean().optional(), // when true, existing image will be cleared
  // profileImage handled by multer
});

router.post(
  "/update-profile",
  authenticate,
  uploadProfileImage,
  validate(updateProfileSchema),
  authController.updateProfile
);

module.exports = router;