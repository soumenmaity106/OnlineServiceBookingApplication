const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createService = {
  body: Joi.object().keys({
    services_type: Joi.string().required(),
    user_address: Joi.required().custom(objectId),
    service_date: Joi.date().required(),
    service_start_time: Joi.number().integer().required().greater(60).less(1440),
    number_of_hours: Joi.number().integer().required().greater(1).less(10),
  }),
};

const getService = {
  query: Joi.object().keys({
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSingelService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId),
  }),
};

const updateService = {
  params: Joi.object().keys({
    serviceId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      services_type: Joi.string(),
      user_address: Joi.custom(objectId),
      service_date: Joi.date(),
      service_start_time: Joi.number().integer().greater(60).less(1440),
      number_of_hours: Joi.number().integer().greater(1).less(10),
    })
    .min(1),
};

const deleteService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createService,
  getService,
  getSingelService,
  updateService,
  deleteService,
};
