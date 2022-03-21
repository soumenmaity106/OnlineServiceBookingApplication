const multer = require('multer');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const profileUpload = require('../middlewares/imageUpload');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user.email, verifyEmailToken);
  return res.status(httpStatus.CREATED).send({ user, message: 'We sent an email link to complete your registration' });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  if (user.status_2fa) {
    const check2factorauthentication = authService.check2factorauthentication(user.id);
    if (check2factorauthentication) {
      const tokens2fact = await tokenService.generate2FacAuthTokens(user);
      return res.send({ tokens: tokens2fact });
    }
  }

  const tokens = await tokenService.generateAuthTokens(user);
  return res.send({ user, tokens });
});
const verifyTwoFactorOtp = catchAsync(async (req, res) => {
  const { otpToken, otp } = req.body;
  const tokenverify = await authService.verifyTwoFactorAuthentication(otpToken);
  const user = await authService.otpVerification(tokenverify._id, otp);
  const tokens = await tokenService.generateAuthTokens(user);
  return res.send({ user, tokens });
});
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const manageProfile = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const upload = profileUpload.single('profileImage');
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      res.status(httpStatus.UNAUTHORIZED).json(err);
    } else if (err) {
      res.status(httpStatus.UNAUTHORIZED).json(err);
    }
    const { name, phone } = req.body;
    if (req.file === undefined) {
      await authService.profileImageUpload(undefined, userId, name, phone);
      return res.send({ message: 'success' });
    }

    await authService.profileImageUpload(req.file.filename, userId, name, phone);
    return res.send({ message: 'success' });
  });
});

const setTwoFactorAuthentication = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { status } = req.body;
  await authService.twoFactorAuthentication(userId, status);
  return res.send({ message: 'success' });
});

const userCreateAddress = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const reqBody = req.body;
  const { role } = req.user;
  if (role !== 'user') {
    return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Users will be able to create address' });
  }
  await authService.userCreateAddress(reqBody, userId);
  return res.send({ message: 'success' });
});

const getUserAddress = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const getAddress = await authService.userGetAddress(userId);
  return res.send({ data: getAddress });
});

const setUserDefaultAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;
  await authService.setDefaultAddress(addressId, userId);
  return res.send({ message: 'success' });
});

module.exports = {
  register,
  login,
  verifyTwoFactorOtp,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  manageProfile,
  setTwoFactorAuthentication,
  userCreateAddress,
  getUserAddress,
  setUserDefaultAddress,
};
