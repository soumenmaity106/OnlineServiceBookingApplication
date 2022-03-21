const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    role: Joi.string().required(),
    services: Joi.string(),
    start_time: Joi.number(),
    end_time: Joi.number(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const otpLogin = {
  body: Joi.object().keys({
    otpToken: Joi.string().required(),
    otp: Joi.number().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const createAddress = {
  body: Joi.object().keys({
    address_for: Joi.string().required().min(3).max(40),
    street_address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postal_code: Joi.string().required(),
  }),
};
const defaultAddress = {
  params: Joi.object().keys({
    addressId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  otpLogin,
  forgotPassword,
  resetPassword,
  verifyEmail,
  createAddress,
  defaultAddress,
};
