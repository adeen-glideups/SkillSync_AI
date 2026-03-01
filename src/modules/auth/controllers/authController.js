const { asyncHandler } = require("../../../shared/utils/asyncHandler");
const { sendSuccess, sendCreated } = require("../../../shared/utils/response");
const authService = require("../services/authService");
const config = require("../../../config");
const baseUrl = config.app.baseUrl;

/* ---------------------------
   ✅ STEP 1: SIGNUP
--------------------------- */
const signup = asyncHandler(async (req, res) => {
  const { email, password, name, gender, } = req.body;
  const profileImage = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;
  console.log("Signup data:", { email, name, gender, profileImage }); // Debug log
  const result = await authService.signup({ email, password, name, gender, profileImage });

  sendCreated(res, result, "Signup successful, Otp has Sended to your email verify your email");
});

/* ---------------------------
   ✅ STEP 2: REQUEST OTP
--------------------------- */
const requestOtp = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;

  const result = await authService.requestOtp({ email, purpose });

  sendSuccess(res, result, "OTP sent successfully");
});

/* ---------------------------
   ✅ STEP 3: VERIFY OTP
--------------------------- */
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;

  // gather optional device info from headers/body
  const deviceModel = req.body.deviceModel || req.headers["x-device-type"] || "unknown";
  const ipAddress = req.ip || req.connection.remoteAddress;
  const fcmToken = req.body.fcmToken || req.headers["x-fcm-token"] || null;

  if (purpose === "VERIFYEMAIL") {
    const result = await authService.verifyEmailOtp(email, otp, purpose, {
      deviceModel,
      ipAddress,
      fcmToken,
    });
    return sendSuccess(res, result, "OTP verified successfully");
  } else if (purpose === "FORGOTPASSWORD") {
    const result = await authService.verifyPasswordOtp(email, otp, purpose);
    return sendSuccess(res, result, "OTP verified successfully, Now you can reset your password");
  } else if (purpose === "LOGIN") {
    const result = await authService.verifyOtp(email, otp, purpose);
    sendSuccess(res, result, "OTP verified successfully");
  } else {
    return sendSuccess(res, null, "OTP verified successfully");
  }
});


/* ---------------------------
   LOGIN
--------------------------- */
const loginWithEmail = asyncHandler(async (req, res) => {
  const { email, password, deviceModel, fcmToken } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await authService.loginWithEmail({
    email,
    password,
    deviceModel,
    ipAddress,
    fcmToken,
  });

  sendSuccess(res, result, "Login successful");
});

/* ---------------------------
   UPDATE PASSWORD
--------------------------- */
const updatePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.user.userId;
  console.log("User ID:", userId); // Debug log
  console.log("Updating password for userId:", password); // Debug log
  const result = await authService.updatePassword(
    userId,
    password,
  );

  sendSuccess(res, result, "Password Updated Successfully, Please login again");
});
const forgotPasswordRequestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.ForgotPasswordRequestOtp({ email });
  sendSuccess(res, result, "OTP sent to your email");
});
/* ---------------------------
   REFRESH TOKEN
--------------------------- */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshTokens(refreshToken);

  sendSuccess(res, result, "Tokens refreshed");
});

/* ---------------------------
   LOGOUT
--------------------------- */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  await authService.logout(refreshToken);

  sendSuccess(res, null, "Logout successful");
});

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.userId);

  sendSuccess(res, null, "Logged out from all devices");
});

const joinWithFirebase = asyncHandler(async (req, res) => {
  const { firebaseToken } = req.body;
  const deviceModel = req.headers["x-device-type"];
  const fcmToken = req.headers["x-fcm-token"];
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await authService.joinWithFirebase({
    firebaseToken,
    deviceModel,
    fcmToken,
    ipAddress,
  });

  sendSuccess(res, result, "Successfully joined with Firebase");
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { name, gender, removeProfileImage } = req.body;

  // determine profileImage value: uploaded file takes precedence
  let profileImage;
  if (req.file) {
    profileImage = `${baseUrl}/uploads/${req.file.filename}`;
  } else if (removeProfileImage) {
    profileImage = null; // explicit clear flag
  }

  const result = await authService.updateProfile({
    userId,
    name,
    gender,
    profileImage,
  });

  sendSuccess(res, result, "Profile updated successfully");
});

module.exports = {
  signup,
  requestOtp,
  verifyOtp,
  loginWithEmail,
  updatePassword,
  refreshToken,
  logout,
  logoutAll,
  forgotPasswordRequestOtp,
  joinWithFirebase,
  updateProfile,
};