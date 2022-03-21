const cron = require('node-cron');
const moment = require('moment');

const catchAsync = require('../utils/catchAsync');
const { GlobalTime } = require('../middlewares/moment');

const { dashbaordService } = require('../services');

const getDashbaord = catchAsync(async (req, res) => {
  const data = await dashbaordService.getuserallServicehistory();
  return res.send(data);
});

// */30 * * * *
cron.schedule(' * * * * * *', async () => {
  const currentTime = GlobalTime();
  const add30mints = moment(currentTime).add(30, 'minutes');
  const utcFormMate30Mints = new Date(add30mints.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
  await dashbaordService.notificationMailSchdule(currentTime, utcFormMate30Mints);
});
module.exports = {
  getDashbaord,
};
