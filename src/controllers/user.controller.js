const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createService = catchAsync(async (req, res) => {
  await userService.checkUserRoll(req.user);
  const newService = req.body;
  const service = await userService.userNewServiceCreate(newService, req.user._id);
  res.status(httpStatus.CREATED).send(service);
});

const listService = catchAsync(async (req, res) => {
  await userService.checkUserRoll(req.user);
  const data = await userService.userServiceList(req.user._id);
  res.send({ data });
});

const getService = catchAsync(async (req, res) => {
  await userService.checkUserRoll(req.user);
  const service = await userService.getServiceById(req.params.serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }
  res.send({ service });
});

const updateUserService = catchAsync(async (req, res) => {
  await userService.checkUserRoll(req.user);
  const service = await userService.updateUserServiceById(req.params.serviceId, req.body);
  res.send({ service });
});

const getServiceDelete = catchAsync(async (req, res) => {
  await userService.checkUserRoll(req.user);
  await userService.deleteUserByServiceId(req.params.serviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

const listOfApplayProfessional = catchAsync(async (req, res) => {
  await userService.checkUserRoll(req.user);
  const job = await userService.getApplayJob(req.params.jobId, req.user);
  return res.send({ data: job });
});

const professionalAccept = catchAsync(async (req, res) => {
  await userService.checkUserRoll(req.user);
  await userService.AcceptProfessioonal(req.params.jobId, req.params.professioonalId, req.user);
  return res.send();
});

const userGetPastJob = catchAsync(async (req, res) => {
  await userService.checkUserRoll(req.user);
  const pastJob = await userService.listOfUserPastJob(req.user);
  return res.send({ data: pastJob });
});

module.exports = {
  createService,
  listService,
  getService,
  updateUserService,
  getServiceDelete,
  listOfApplayProfessional,
  professionalAccept,
  userGetPastJob,
};
