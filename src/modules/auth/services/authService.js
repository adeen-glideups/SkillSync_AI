const bcrypt = require("bcrypt");
const config = require("../../../config");
const { prisma } = require("../../../config/database");
const { AppError } = require("../../../shared/middleware/errorHandler");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("./tokenService");
const baseURL = config.app.baseUrl;
const authModel = require("../model/authModel");
const { verifyFirebaseToken } = require("./firbaseService");
const ERROR_CODES = require("../../../shared/constants/errorCodes");

/* ---------------------------
   ✅ STEP 1: SIGNUP (Email + Password)
--------------------------- */
const signup = async ({ email, password, name, gender, profileImage }) => {
  // Check if email already exists
  const existingUser = await authModel.findUserByEmail(email);
  if (existingUser && existingUser.isEmailVerified == false) {
    await authModel.deleteUserById(existingUser.id);
  } else if (existingUser && existingUser.userType === "buissness" && existingUser.isEmailVerified) {
    throw new AppError(
      "This account is already registered as a partner.",
      409,
      ERROR_CODES.EMAIL_ALREADY_EXISTS
    );
  }
  else if (existingUser && existingUser.isEmailVerified) {
    throw new AppError(
      `Email already registered. Proceed to login.`,
      409,
      ERROR_CODES.EMAIL_ALREADY_EXISTS
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  // Create user with minimal info
  const user = await authModel.createUser({
    email,
    passwordHash: hashedPassword,
    name,
    gender,
    profileImage,
    provider: "EMAIL",
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete old OTPs
  const purpose = "VERIFYEMAIL";
  await authModel.deleteUserOtps(user.id, purpose);

  // Create new OTP
  await authModel.createOtp({
    userId: user.id,
    otp,
    purpose,
  });

  // Send OTP email
  const emailService = require("./emailService");
  await emailService.sendOtpEmail(email, otp, user.name, "VERIFYEMAIL");
  return ;
};

/* ---------------------------
   ✅ STEP 2: REQUEST OTP
--------------------------- */
const requestOtp = async ({ email, purpose }) => {
  const user = await authModel.findUserByEmail(email);
  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND);
  }

  if (user.isDeleted) {
    throw new AppError(
      "Account is deactivated",
      403,
      ERROR_CODES.ACCOUNT_DEACTIVATED
    );
  }
  if (purpose !== "LOGIN" && purpose !== "VERIFYEMAIL" && purpose !== "VERIFYPHONE" && purpose !== "FORGOTPASSWORD" && purpose !== "UPDATEPASSWORD" && purpose !== "DELETEACCOUNT") {
    throw new AppError("Invalid OTP purpose", 400, ERROR_CODES.INVALID_INPUT);
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete old OTPs
  await authModel.deleteUserOtps(user.id, purpose);

  // Create new OTP
  await authModel.createOtp({
    userId: user.id,
    otp,
    purpose,
  });

  // Send OTP email
  const emailService = require("./emailService");
  await emailService.sendOtpEmail(email, otp, user.name, purpose);

  return otp;
};

/* ---------------------------
   ✅ STEP 3: VERIFY OTP
--------------------------- */

const verifyEmailOtp = async (
  email,
  otp,
  purpose = "VERIFYEMAIL",
  options = {}
) => {
  const { deviceModel = "unknown", ipAddress = null, fcmToken = null } = options;

  const user = await authModel.findUserByEmail(email);
  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND);
  }

  const otpRecord = await authModel.findLatestOtp(user.id, purpose);
  if (!otpRecord) {
    throw new AppError(
      "OTP not found or expired",
      400,
      ERROR_CODES.OTP_NOT_FOUND
    );
  }

  // Check OTP age (1 minute)
  const otpAge = Date.now() - otpRecord.createdAt.getTime();
  if (otpAge > 60000) {
    await authModel.deleteOtp(otpRecord.id);
    throw new AppError("OTP expired", 400, ERROR_CODES.OTP_EXPIRED);
  }

  if (otpRecord.otp !== otp) {
    throw new AppError("Invalid OTP", 400, ERROR_CODES.OTP_INVALID);
  }
  await authModel.updateIsEmailVerified(email);
  // Delete OTP after verification
  await authModel.deleteOtp(otpRecord.id);
  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Create logged device
  await authModel.createLoggedDevice({
    userId: user.id,
    refreshToken,
    deviceModel,
    ipAddress,
    fcmToken,
  });

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    gender: user.gender,
    profileImage: user.profileImage,
    isEmailVerified: true,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    accessToken,
    refreshToken,
  };
  return userData;
};


/* ---------------------------
   LOGIN
--------------------------- */
const loginWithEmail = async ({
  email,
  password,
  deviceModel,
  ipAddress,
  fcmToken,
}) => {
  const user = await authModel.findUserByEmail(email);
  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  if (user.isDeleted) {
    throw new AppError(
      "Account is deactivated",
      403,
      ERROR_CODES.ACCOUNT_DEACTIVATED
    );
  }
  // Bcrypt compare with reduced salt rounds (8) = ~30-50ms instead of 100-150ms
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(
      "Invalid email or password",
      401,
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  const accessToken = generateAccessToken({
    userId: user.id,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Create logged device
  await authModel.createLoggedDevice({
    userId: user.id,
    refreshToken,
    deviceModel,
    ipAddress,
    fcmToken,
  });

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    gender: user.gender,
    profileImage: user.profileImage,
    isEmailVerified: true,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    accessToken,
    refreshToken,
  };
  return userData;  
};

/* ---------------------------
   UPDATE PASSWORD
--------------------------- */
const ForgotPasswordRequestOtp = async ({ email, purpose = "FORGOTPASSWORD" }) => {
  const user = await authModel.findUserByEmail(email);
  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND);
  }

  if (user.isDeleted) {
    throw new AppError(
      "Account is deactivated",
      403,
      ERROR_CODES.ACCOUNT_DEACTIVATED
    );
  }
  if (user.provider !== "EMAIL") {
    throw new AppError("Password change is only available for email registered users", 400, ERROR_CODES.INVALID_INPUT);
  }
  if (purpose !== "FORGOTPASSWORD") {
    throw new AppError("Invalid OTP purpose", 400, ERROR_CODES.INVALID_INPUT);
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete old OTPs
  await authModel.deleteUserOtps(user.id, purpose);

  // Create new OTP
  await authModel.createOtp({
    userId: user.id,
    otp,
    purpose,
  });

  // Send OTP email
  const emailService = require("./emailService");
  await emailService.sendOtpEmail(email, otp, user.name, "FORGOTPASSWORD");

  return otp;
};
const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await authModel.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND);
  }
  if (user.isDeleted) {
    throw new AppError("User is deactivated", 403, ERROR_CODES.ACCOUNT_DEACTIVATED);
  }
  if (user.provider !== "EMAIL") {
    throw new AppError("Password change is only available for email registered users", 400, ERROR_CODES.INVALID_INPUT);
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isOldPasswordValid) {
    throw new AppError("Old password is incorrect", 401, ERROR_CODES.OLD_PASSWORD_INCORRECT);
  }

  const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

  await authModel.updateUserPassword(user.id, hashedPassword);

  await authModel.deleteAllTokensByUser(user.id);

  return;
};
const verifyPasswordOtp = async (email, otp, purpose = "FORGOTPASSWORD") => {
  const user = await authModel.findUserByEmail(email);
  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND);
  }
  if (user.isDeleted) {
    throw new AppError("User is deactivated", 404, ERROR_CODES.USER_NOT_FOUND);
  }
  const otpRecord = await authModel.findLatestOtp(user.id, purpose);
  if (!otpRecord) {
    throw new AppError(
      "OTP not found or expired",
      400,
      ERROR_CODES.OTP_NOT_FOUND
    );
  }

  // Check OTP age (1 minute)
  const otpAge = Date.now() - otpRecord.createdAt.getTime();
  if (otpAge > 60000) {
    await authModel.deleteOtp(otpRecord.id);
    throw new AppError("OTP expired", 400, ERROR_CODES.OTP_EXPIRED);
  }

  if (otpRecord.otp !== otp) {
    throw new AppError("Invalid OTP", 400, ERROR_CODES.OTP_INVALID);
  }
  // Delete OTP after verification
  await authModel.deleteOtp(otpRecord.id);
  const accessToken = generateAccessToken({
    userId: user.id,
  });
  const refreshToken = generateRefreshToken({ userId: user.id });
  await authModel.createLoggedDevice({
    userId: user.id,
    refreshToken: refreshToken,
    deviceModel: "unknown",
  });

  return { accessToken, refreshToken };
};
/* ---------------------------
   REFRESH TOKENS
--------------------------- */
const refreshTokens = async (refreshToken) => {
  const decoded = verifyToken(refreshToken, "refresh");

  const storedToken = await authModel.findRefreshToken({
    token: refreshToken,
    userId: decoded.userId,
  });

  if (!storedToken) {
    throw new AppError(
      "Invalid refresh token",
      401,
      ERROR_CODES.REFRESH_TOKEN_INVALID
    );
  }

  await authModel.deleteRefreshTokenById(storedToken.id);

  const user = await authModel.findUserById(decoded.userId);
  if (!user || user.isDeleted) {
    throw new AppError(
      "User not found or inactive",
      401,
      ERROR_CODES.USER_NOT_FOUND
    );
  }

  const newAccessToken = generateAccessToken({
    userId: user.id,
    userType: user.userType,
  });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  await authModel.createLoggedDevice({
    userId: user.id,
    refreshToken: newRefreshToken,
    deviceModel: storedToken.deviceModel || "unknown",
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/* ---------------------------
   LOGOUT
--------------------------- */
const logout = async (refreshToken) => {
  await authModel.deleteRefreshToken(refreshToken);
  return;
};

const logoutAll = async (userId) => {
  await authModel.deleteAllTokensByUser(userId);
  return;
};


const joinWithFirebase = async (data) => {
  try {
    const { firebaseToken, deviceModel, fcmToken, ipAddress } = data;

    // Verify Firebase token and extract user info
    const firebaseUser = await verifyFirebaseToken(firebaseToken);

    if (!firebaseUser.email) {
      throw new AppError(
        "Email not found in Firebase token",
        400,
        ERROR_CODES.INVALID_INPUT
      );
    }

    // Check if user already exists
    let user = await authModel.findUserByEmail(firebaseUser.email);
    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;

      // Map Firebase provider to our AuthProvider enum
      let authProvider = "GOOGLE";
      if (firebaseUser.authProvider === "apple.com") {
        authProvider = "APPLE";
      } else if (firebaseUser.authProvider === "google.com") {
        authProvider = "GOOGLE";
      }
      console.log("AuthProvider", authProvider)

      const user = await authModel.createUserJoin({
        email: firebaseUser.email,
        name: firebaseUser.name || `temp_user_${Date.now()}`,
        gender: firebaseUser.gender || "other",
        userType: "buissness",
        provider: authProvider || "GOOGLE",
        username: `temp_username_${Date.now()}`,
        isEmailVerified: true,
      });

      // user = await authModel.createUser({
      //   email: firebaseUser.email,
      //   name: firebaseUser.name,
      //   profileImageUrl: firebaseUser.profileImageUrl,
      //   authProvider,
      //   accountStatus: "ACTIVE",
      //   isEmailVerified: firebaseUser.emailVerified,
      //   isGenderVerified: false,
      //   isSetupCompleted: false,
      //   genderVerificationStatus: "PENDING",
      // });
    } else {
      // Check account status for existing user
      if (user.accountStatus === "SUSPENDED") {
        throw new AppError(
          "Your account has been suspended. Please contact support.",
          403,
          ERROR_CODES.ACCOUNT_SUSPENDED
        );
      }
      if (user.userType !== "buissness") {
        throw new AppError(
          "This account is not a business account, Only Business Can Login here",
          403,
          ERROR_CODES.FORBIDDEN
        );
      }
    }
    const updatedUser = await authModel.findUserByEmail(firebaseUser.email);
    user = updatedUser;
    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Calculate token expiry

    // Store logged device
    await authModel.createLoggedDevice({
      userId: user.id,
      refreshToken,
      deviceModel: deviceModel || "unknown",
      ipAddress: ipAddress || null,
      fcmToken: fcmToken || null,
    });
    const hasBusinessSetup = await authModel.hasBusinessSetup(user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      authProvider: user.provider,
      isNewUser,
      isEmailVerified: user.isEmailVerified,
      buissnessLicenseImg: user.buissnessLicenseImg,
      hasBusinessSetup,
      nic: user.nic ? user.nic.toString() : null,
      isOwnerRegistered: (user.nic && user.phoneNumber && user.OwnerLicenseImg) ? true : false,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error(error);
    throw new AppError(
      error.message || "Firebase authentication failed",
      500,
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
  }

};

// add profile update service
const updateProfile = async ({ userId, name, gender, profileImage }) => {
  const user = await authModel.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND);
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (gender !== undefined) data.gender = gender;
  // allow null to clear existing image
  if (profileImage !== undefined) data.profileImage = profileImage;

  const updated = await authModel.updateUser(userId, data);

  // return selected fields
  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    gender: updated.gender,
    profileImage: updated.profileImage,
    isEmailVerified: updated.isEmailVerified,
    isDeleted: updated.isDeleted,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
};

/* ---------------------------
   GET PROFILE
--------------------------- */
const getProfile = async (userId) => {
  const user = await authModel.findUserProfileById(userId);
  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.USER_NOT_FOUND);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    profileImage: user.profileImage,
    provider: user.provider,
    isEmailVerified: user.isEmailVerified,
    contactInfo: user.contactInfo
      ? {
          phone: user.contactInfo.phone,
          countryCode: user.contactInfo.countryCode,
          city: user.contactInfo.city,
          country: user.contactInfo.country,
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/* ---------------------------
   RESET PASSWORD
--------------------------- */
const resetPassword = async (userId, password) => {
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
  await authModel.updateUserPassword(userId, hashedPassword);
  await authModel.deleteAllTokensByUser(userId);
  return;
};

module.exports = {
  signup,
  requestOtp,
  loginWithEmail,
  verifyEmailOtp,
  updatePassword,
  resetPassword,
  refreshTokens,
  logout,
  logoutAll,
  joinWithFirebase,
  verifyPasswordOtp,
  ForgotPasswordRequestOtp,
  updateProfile,
  getProfile,
};