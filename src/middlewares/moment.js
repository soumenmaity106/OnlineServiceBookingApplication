const moment = require('moment');

const GlobalTime = () => {
  const today = new Date();
  const time = moment(today).tz('Asia/Calcutta');
  const timeFormate = new Date(time.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
  return timeFormate;
};

const setutcHoureStartDate = (date) => {
  const dateformmate = moment(date).utcOffset(0);
  dateformmate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  dateformmate.toISOString();
  dateformmate.format();
  return new Date(dateformmate);
};
const setutcHoureEndtDate = (date) => {
  const dateformmate = moment(date).utcOffset(0);
  dateformmate.set({ hour: 23, minute: 59, second: 59, millisecond: 0 });
  dateformmate.toISOString();
  dateformmate.format();
  return new Date(dateformmate);
};
const GetDate = (date) => {
  return moment(date).format('DD-MM-YYYY');
};
const getTimeFromMins = (mins) => {
  if (mins >= 24 * 60 || mins < 0) {
    throw new RangeError('Valid input should be greater than or equal to 0 and less than 1440.');
  }
  const hours = mins / 60;
  const minits = mins % 60;
  return moment.utc().hours(hours).minutes(minits).format('hh:mm A');
};
module.exports = {
  GlobalTime,
  setutcHoureStartDate,
  setutcHoureEndtDate,
  getTimeFromMins,
  GetDate,
};
