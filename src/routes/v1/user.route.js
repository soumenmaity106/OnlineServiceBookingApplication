const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/place-service', auth(), validate(userValidation.createService), userController.createService);
router.get('/list-service', auth(), validate(userValidation.getService), userController.listService);
router.get('/get-service/:serviceId', auth(), validate(userValidation.getSingelService), userController.getService);
router.patch(
  '/get-service-update/:serviceId',
  auth(),
  validate(userValidation.updateService),
  userController.updateUserService
);
router.delete(
  '/get-service-delete/:serviceId',
  auth(),
  validate(userValidation.deleteService),
  userController.getServiceDelete
);

router.get('/list-of-applay-professional/:jobId', auth(), userController.listOfApplayProfessional);

router.patch('/professional-accept/:jobId/:professioonalId', auth(), userController.professionalAccept);

router.get('/user-past-job', auth(), userController.userGetPastJob);

module.exports = router;
