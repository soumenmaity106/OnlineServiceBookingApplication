const httpStatus = require('http-status');
const fastcsv = require('fast-csv');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const { UserService } = require('../models');
const { setutcHoureStartDate, setutcHoureEndtDate, getTimeFromMins, GetDate } = require('../middlewares/moment');

/**
 * Check Professional roll
 * @param {Object} user
 * @returns {Promise}
 */
const checkProfessionalRoll = async (user) => {
  const userObject = user;
  const { role } = userObject;
  if (role !== 'service') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
  }
  return true;
};

/**
 * Search job
 * @param {object} user
 * @returns {Promise}
 */
const searcJob = async (user) => {
  const professionalObj = user;
  const { services, start_time, end_time } = professionalObj;
  const today = setutcHoureStartDate(new Date());
  const listjob = await UserService.find({
    services_type: services,
    service_status: 'open',
    service_date: { $gte: today },
    service_start_time: { $gte: start_time, $lte: end_time },
  })
    .populate('user_address', 'address_for street_address city state postal_code')
    .populate('user', 'name')
    .select('-apply_professional');
  return listjob;
};
/**
 * Apply job
 * @param {object} user
 * @param {string} jobId
 * @returns {Promise}
 */
const applayServiceJob = async (user, jobId) => {
  const professionalObj = user;
  const { _id } = professionalObj;
  const job = await UserService.findById(jobId);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  const checkAlreadyApplay = await UserService.findOne({ _id: jobId, apply_professional: { $in: [_id] } });

  if (checkAlreadyApplay) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Do not apply this job again');
  }
  const applaythejob = await UserService.updateOne(
    { _id: jobId },
    {
      $push: {
        apply_professional: _id,
      },
    }
  );
  return applaythejob;
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
    accept_professional: _id,
    service_status: 'accept',
    service_date: { $lte: today },
  })
    .sort({
      service_date: 1,
    })
    .populate('accept_professional', 'profile_image name email');
  return pastJob;
};
/**
 * Csv Repot Service
 * @param {ObjectId} _id
 * @param {Date} SatartDate
 * @returns {Date} EndDate
 */
const pastCsvRepot = async (userId, startDate, endDate) => {
  const query = {
    service_status: 'accept',
    accept_professional: userId,
    service_date: {
      $lte: setutcHoureStartDate(startDate),
    },
  };
  if (startDate !== undefined && endDate !== undefined) {
    query.service_date = { $gte: setutcHoureStartDate(startDate), $lte: setutcHoureEndtDate(endDate) };
  }

  const pastservice = await UserService.find(query)
    .populate('user_address', 'address_for street_address city state postal_code')
    .populate('user', 'name');
  return pastservice;
};

/**
 * Convert CSV file
 * @param {ArrayOfObject}CsvData
 */

const csvConvert = async (pastService) => {
  if (pastService.length < 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data is empty');
  }
  const pastServiceArr = [];
  for (let i = 0; i < pastService.length; i += 1) {
    const { street_address, city, state, postal_code } = pastService[i].user_address;
    pastServiceArr.push({
      UserName: pastService[i].user.name,
      JobLocation: `${street_address}/ ${city}/ ${state}/ ${postal_code}`,
      Date: GetDate(pastService[i].service_date),
      Time: getTimeFromMins(pastService[i].service_start_time),
      Duration: pastService[i].number_of_hours,
    });
  }
  const csvname = `${+new Date()}.csv`;
  const pathofCsvfile = path.join(__dirname, '..', 'invoicecsv', `${csvname}`);
  const writeFile = fs.createWriteStream(pathofCsvfile);
  fastcsv
    .write(pastServiceArr, { headers: true })
    .on('finish', function () {})
    .pipe(writeFile);
  return csvname;
};

module.exports = {
  checkProfessionalRoll,
  searcJob,
  applayServiceJob,
  listOfUserPastJob,
  pastCsvRepot,
  csvConvert,
};
