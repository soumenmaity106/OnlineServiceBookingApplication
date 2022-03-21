const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const emailService = require('./email.service');
const { User, Token, Address } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  const checkemailVerify = await userService.getUserByEmailChekEmailVerify(email);
  if (!checkemailVerify) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not allowed to login! You need to confirm your email');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Otp verification auth tokens
 * @param {object} user
 * @param {number} otp
 * @returns {Promise<Object>}
 */
const otpVerification = async (userId, otp) => {
  try {
    const user = await User.findOne({ _id: userId, fa2_otp: otp });
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Not Found`);
    } else {
      await Token.deleteOne({ user: userId, type: tokenTypes.FA2_AUTHENTICATION });
      user.fa2_otp = null;
      await user.save();
      return user;
    }
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, `Otp ${otp} does not match`);
  }
};

/**
 * Verify two factor  auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const verifyTwoFactorAuthentication = async (twofacorToken) => {
  try {
    const twofactorTokenDoc = await tokenService.verifyToken(twofacorToken, tokenTypes.FA2_AUTHENTICATION);
    const user = await User.findOne({ _id: twofactorTokenDoc.user });
    if (!user) {
      throw new Error();
    }
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Profile Image Upload
 * @param {string} fileName
 * @param {string} userId
 * @param {string} phoe
 * @param {string} name
 * @returns {Promise}
 */

const profileImageUpload = async (fileName, userId, name, phone) => {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    } else {
      if (fileName) {
        user.profile_image = fileName;
      }
      if (phone !== undefined) {
        const checkPhoe = await User.isPhoneTaken(phone, userId);
        if (checkPhoe) {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken');
        }
        const phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (phone.match(phoneno)) {
          user.phone = phone;
        } else {
          throw new ApiError(httpStatus.BAD_REQUEST, 'Please enter to a valid phone number');
        }
      }
      if (name !== undefined) {
        user.name = name;
      }

      const savedata = await user.save();
      return savedata;
    }
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Profile image upload failed');
  }
};

/**
 * 2FA authentication
 * @param {string} userId
 * * @param {boolean} status
 * @returns {Promise}
 */
const twoFactorAuthentication = async (userId, status) => {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    user.status_2fa = status;
    const saveData = await user.save();
    return saveData;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, '2FA authentication. failed');
  }
};

const check2factorauthentication = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    const rendomNumber = Math.floor(100000 + Math.random() * 900000);
    user.fa2_otp = rendomNumber;
    await emailService.send2factAuthentication(user.email, rendomNumber);
    await user.save();
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, '2FA authentication error');
  }
};

/**
 * Create Address
 * @param {object} addressBody
 * @param {string} userId
 * @returns {Promise}
 */
const userCreateAddress = async (addressBody, userId) => {
  try {
    const newAddress = addressBody;
    newAddress.user = userId;
    const createAddressSchema = new Address(newAddress);
    const saveAddress = await createAddressSchema.save();
    return saveAddress;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Something went wrong');
  }
};

/**
 * Get Address
 * @param {string} userId
 * @returns {Promise}
 */
const userGetAddress = async (userId) => {
  try {
    const address = await Address.find({ user: userId }).sort({ address_default: 1 });
    return address;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Something went wrong');
  }
};

/**
 * Default Address
 * @param {string} addressId
 * @param {string} userId
 * @returns {Promise}
 */
const setDefaultAddress = async (addressId, userId) => {
  try {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await Address.updateOne({ _id: addressId, user: userId }, { address_default: 1 });
    await Address.updateMany({ _id: { $ne: addressId }, user: userId }, { address_default: 2 });
    return address;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Something went wrong');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  otpVerification,
  refreshAuth,
  resetPassword,
  verifyEmail,
  profileImageUpload,
  twoFactorAuthentication,
  check2factorauthentication,
  verifyTwoFactorAuthentication,
  userCreateAddress,
  userGetAddress,
  setDefaultAddress,
};
