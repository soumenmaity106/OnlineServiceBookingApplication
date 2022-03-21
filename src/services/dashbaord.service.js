const { User, UserService } = require('../models');
const { emailService } = require('./email.service');
const { setutcHoureStartDate, getTimeFromMins, GetDate } = require('../middlewares/moment');

/**
 * Get Dashbaord
 * @param {object} user
 * @returns {Promise}
 */
const getuserallServicehistory = async () => {
  const toDayDate = new Date();
  const convertDate = setutcHoureStartDate(toDayDate);

  const listupcomingservices = await User.aggregate([
    {
      $match: {
        role: 'user',
      },
    },
    {
      $lookup: {
        from: 'userservices',
        localField: '_id',
        foreignField: 'user',
        as: 'upcoming_services',
      },
    },
    {
      $match: {
        'upcoming_services.service_status': 'open',
        'upcoming_services.service_date': { $gte: convertDate },
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        profile_image: 1,
        'upcoming_services.service_status': 1,
        'upcoming_services.services_type': 1,
        'upcoming_services.service_date': 1,
      },
    },
  ]);

  const serviceprofessionalslist = await UserService.aggregate([
    {
      $match: {
        service_status: 'accept',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'accept_professional',
        foreignField: '_id',
        as: 'professionl',
      },
    },
    {
      $unwind: '$professionl',
    },
    {
      $group: {
        _id: '$services_type',
        professionl: {
          $push: {
            name: '$professionl.name',
            email: '$professionl.email',
            phone: '$professionl.phone',
            profile_image: '$professionl.profile_image',
            compeletedService: { $sum: 1 },
          },
        },
      },
    },
  ]);

  const userSibmitedService = await UserService.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userlist',
      },
    },
    {
      $unwind: '$userlist',
    },
    {
      $group: {
        _id: '$services_type',
        userlist: {
          $push: {
            name: '$userlist.name',
            email: '$userlist.email',
            phone: '$userlist.phone',
            profile_image: '$userlist.profile_image',
            compeletedService: { $sum: 1 },
          },
        },
      },
    },
  ]);
  const result = await Promise.all([listupcomingservices, serviceprofessionalslist, userSibmitedService]);
  return {
    listupcomingservices: result[0],
    serviceprofessionalslist: result[1],
    userSibmitedService: result[2],
  };
};

/**
 * Schdule Send Notification
 * @param {object} user
 * @returns {Promise}
 */

const notificationMailSchdule = async (currentTime, utcFormMate30Mints) => {
  const currentTimeDate = currentTime;
  const utcFormMate30MintsDate = utcFormMate30Mints;
  const serviceNotificationData = await UserService.find({
    service_status: 'accept',
    service_date: { $gte: currentTimeDate, $lte: utcFormMate30MintsDate },
  })
    .populate('user')
    .populate('accept_professional');
  serviceNotificationData.forEach(async (item) => {
    const pastServiceArr = {
      useremail: item.user.email,
      professionlemail: item.accept_professional.email,
      Date: GetDate(item.service_date),
      Time: getTimeFromMins(item.service_start_time),
      Duration: item.number_of_hours,
    };
    const { useremail, Date, Time, professionlemail } = pastServiceArr;
    await emailService.send2fututrejob(useremail, Date, Time);
    await emailService.send2fututrejob(professionlemail, Date, Time);
  });
};

module.exports = {
  getuserallServicehistory,
  notificationMailSchdule,
};
