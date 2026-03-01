const { prisma } = require("../../../config/database");
const { AppError } = require("../../../shared/middleware/errorHandler");
const ERROR_CODES = require("../../../shared/constants/errorCodes");

/* ---------------------------
   USER QUERIES
--------------------------- */

const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: {email},
  });
};

const updateIsEmailVerified = (email) => {
  return prisma.user.update({
    where: {
      email,
    },
    data: { isEmailVerified: true },
  });
};

const deleteUserById = (id) => {
  return prisma.user.delete({
    where: { id },
  });
};
const createUser = (data) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      name: true,
      profileImage: true,
      provider: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });
};
const createUserJoin = (data) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      provider: true,
      profileImage: true,
      OwnerLicenseImg: true,
      isEmailVerified: true,
      userType: true,
      createdAt: true,
    },
  });
};
const findUserById = (id) => {
  return prisma.user.findUnique({
    where: { id, isDeleted: false },
  });
};

const updateUser = (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};

const findUserByPhone = (phoneNumber) => {
  return prisma.user.findFirst({
    where: { phoneNumber, isDeleted: false },
  });
};

const updateUserPassword = (userId, passwordHash) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

/* ---------------------------
   DEVICE / REFRESH TOKEN QUERIES
--------------------------- */

const createLoggedDevice = (data) => {
  return prisma.loggedDevices.create({
    data: {
      userId: data.userId,
      refreshToken: data.refreshToken,
      deviceModel: data.deviceModel || "unknown",
      ipAddress: data.ipAddress,
      fcmToken: data.fcmToken,
    },
  });
};

const findRefreshToken = ({ token, userId }) => {
  return prisma.loggedDevices.findFirst({
    where: {
      refreshToken: token,
      userId,
    },
  });
};

const deleteRefreshTokenById = (id) => {
  return prisma.loggedDevices.delete({
    where: { id },
  });
};

const deleteRefreshToken = (token) => {
  return prisma.loggedDevices.deleteMany({
    where: { refreshToken: token },
  });
};

const deleteAllTokensByUser = (userId) => {
  return prisma.loggedDevices.deleteMany({
    where: { userId },
  });
};

/* ---------------------------
   OTP QUERIES
--------------------------- */

const createOtp = (data) => {
  return prisma.otp.create({
    data: {
      userId: data.userId,
      otp: data.otp,
      purpose: data.purpose,
    },
  });
};

const findLatestOtp = (userId, purpose) => {
  return prisma.otp.findFirst({
    where: { userId, purpose },
    orderBy: { createdAt: "desc" },
  });
};

const deleteOtp = (id) => {
  return prisma.otp.delete({
    where: { id },
  });
};

const deleteUserOtps = (userId, purpose) => {
  return prisma.otp.deleteMany({
    where: { userId, purpose },
  });
};


module.exports = {
  // User
  findUserByEmail,
  updateIsEmailVerified,
  createUser,
  deleteUserById,
  findUserById,
  updateUser,
  findUserByPhone,
  createUserJoin,
  updateUserPassword,

  // Device/Token
  createLoggedDevice,
  findRefreshToken,
  deleteRefreshTokenById,
  deleteRefreshToken,
  deleteAllTokensByUser,

  // OTP
  createOtp,
  findLatestOtp,
  deleteOtp,
  deleteUserOtps,

};