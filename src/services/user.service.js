const httpStatus = require('http-status');
const { User, UserService } = require('../models');
const ApiError = require('../utils/ApiError');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (await User.isPhoneTaken(userBody.phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken');
  }
  return User.create(userBody);
};

/**
 * User Service list
 * @param {userId}
 * @returns {Promise<QueryResult>}
 */
const userServiceList = async (userId) => {
  const service = await UserService.find({ user: userId })
    .populate('user_address', 'address_for street_address city state')
    .sort({ service_date: -1 });
  return service;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};
/**
 * Get service by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getServiceById = async (id) => {
  return UserService.findById(id).populate('user_address', 'address_for street_address city state');
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Get user by email check verification
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmailChekEmailVerify = async (email) => {
  return User.findOne({ email, isEmailVerified: true });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};
/**
 * Update user by id
 * @param {ObjectId} serviceId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserServiceById = async (serviceId, updateBody) => {
  const service = await getServiceById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }

  Object.assign(service, updateBody);
  await service.save();
  return service;
};

/**
 * Delete service by id
 * @param {ObjectId} serviceId
 * @returns {Promise<User>}
 */
const deleteUserByServiceId = async (serviceId) => {
  const service = await getServiceById(serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  await UserService.deleteOne({ _id: serviceId });
  return service;
};

/**
 * Check user roll
 * @param {ObjectId} user
 * @returns {Promise<User>}
 */
const checkUserRoll = async (user) => {
  const userObject = user;
  const { role } = userObject;
  if (role !== 'user') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
  }
  return true;
};

/**
 * User create a new service
 * @param {Object} service
 *  @param {ObjectId} getUserById
 * @returns {Promise<User>}
 */
const userNewServiceCreate = async (service, userId) => {
  const newService = service;
  newService.user = userId;
  const newServiceSchema = new UserService(newService);
  const saveNewService = await newServiceSchema.save();
  return saveNewService;
};

/**
 * Get Applay job
 * @param {ObjectId} JobId
 * @returns {Promise<User>}
 */
const getApplayJob = async (jobId, user) => {
  const userObject = user;
  const { _id } = userObject;
  const job = await UserService.findOne({ _id: jobId, user: _id, service_status: 'open' })
    .populate('apply_professional', 'profile_image name phone email')
    .select('-user -user_address');
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  return job;
};
/**
 * User Get Accept Professioonal
 * @param {ObjectId} jobId
 * @param {ObjectId} professioonalId
 * @returns {Promise<User>}
 */
const AcceptProfessioonal = async (jobId, professioonalId, user) => {
  const userObject = user;
  const { _id } = userObject;
  const job = UserService.findOne({ _id: jobId, user: _id });
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  const checkProfessionexit = await UserService.findOne({
    _id: jobId,
    user: _id,
    apply_professional: { $in: [professioonalId] },
  });
  if (!checkProfessionexit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found professionals in this job');
  }
  const acceptprofessional = await UserService.updateOne(
    {
      _id: jobId,
      user: _id,
    },
    {
      $set: {
        apply_professional: [],
        service_status: 'accept',
        accept_professional: professioonalId,
      },
    }
  );
  return acceptprofessional;
};
/**
 * User Past Job
 * @param {object} user
 * @returns {Promise}
 */

const listOfUserPastJob = async (user) => {
  const userObject = user;
  const { _id } = userObject;
  const today = new Date();
  const pastJob = await UserService.find({
    user: _id,
    service_status: 'accept',
    service_date: { $lte: today },
  })
    .sort({
      service_date: 1,
    })
    .populate('accept_professional', 'profile_image name email');
  return pastJob;
};

module.exports = {
  createUser,
  userServiceList,
  getUserById,
  getUserByEmail,
  getUserByEmailChekEmailVerify,
  updateUserById,
  updateUserServiceById,
  deleteUserByServiceId,
  checkUserRoll,
  userNewServiceCreate,
  getServiceById,
  getApplayJob,
  AcceptProfessioonal,
  listOfUserPastJob,
};
