const admin = require('firebase-admin');
// const serviceAccount = require("../../../config/firebase.json");
const { AppError } = require("../../../shared/middleware/errorHandler");
const  ERROR_CODES  = require("../../../shared/constants/errorCodes");

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK (lazy initialization)
 */
const initializeFirebase = () => {
  if (firebaseInitialized) return;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  firebaseInitialized = true;
};

const verifyFirebaseToken = async (idToken) => {
  try {
    initializeFirebase();

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    return {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      gender: decodedToken.gender || "other",  
      emailVerified: decodedToken.email_verified ?? false,
      name: decodedToken.name || null,
      profileImageUrl: decodedToken.picture || null,
      authProvider: decodedToken.firebase?.sign_in_provider || "GOOGLE",
    };
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      throw new AppError("Firebase token has expired", 401, ERROR_CODES.INVALID_TOKEN);
    }
    if (error.code === "auth/id-token-revoked") {
      throw new AppError("Firebase token has been revoked", 401, ERROR_CODES.INVALID_TOKEN);
    }
    throw new AppError("Invalid Firebase token", 401, ERROR_CODES.INVALID_TOKEN);
  }
};

/**
 * Verify Firebase ID token for phone auth and extract phone number
 * @param {string} idToken - Firebase ID token from Flutter client (phone auth)
 * @returns {Promise<Object>} - Extracted user info (phoneNumber)
 */
const verifyFirebasePhoneToken = async (idToken) => {
  try {
    initializeFirebase();

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    return {
      firebaseUid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number || null,
      authProvider: decodedToken.firebase?.sign_in_provider || "phone",
    };
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      throw new AppError("Firebase token has expired", 401, ERROR_CODES.INVALID_TOKEN);
    }
    if (error.code === "auth/id-token-revoked") {
      throw new AppError("Firebase token has been revoked", 401, ERROR_CODES.INVALID_TOKEN);
    }
    throw new AppError("Invalid Firebase token", 401, ERROR_CODES.INVALID_TOKEN);
  }
};

module.exports = {
  verifyFirebaseToken,
  verifyFirebasePhoneToken,
};
