const catchAsync = require('../utils/catchAsync');
const { professionalService } = require('../services');

const jobSearch = catchAsync(async (req, res) => {
  await professionalService.checkProfessionalRoll(req.user);
  const jobList = await professionalService.searcJob(req.user);
  res.send({ data: jobList });
});

const applayJob = catchAsync(async (req, res) => {
  await professionalService.checkProfessionalRoll(req.user);
  await professionalService.applayServiceJob(req.user, req.params.jobId);
  res.send();
});

const professionalrGetPastJob = catchAsync(async (req, res) => {
  await professionalService.checkProfessionalRoll(req.user);
  const pastJob = await professionalService.listOfUserPastJob(req.user);
  return res.send({ data: pastJob });
});

const professionalCsvRepot = catchAsync(async (req, res) => {
  const { _id } = req.user;
  const { startDate, endDate } = req.query;
  const listOfpastData = await professionalService.pastCsvRepot(_id, startDate, endDate);
  const arraytoCsvconvert = await professionalService.csvConvert(listOfpastData);
  return res.send({ data: arraytoCsvconvert });
});

module.exports = {
  jobSearch,
  applayJob,
  professionalrGetPastJob,
  professionalCsvRepot,
};
