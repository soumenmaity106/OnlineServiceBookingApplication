const express = require('express');
const auth = require('../../middlewares/auth');
const professionalController = require('../../controllers/professionals.controller');

const router = express.Router();

router.get('/job-search', auth(), professionalController.jobSearch);
router.patch('/applay-job/:jobId', auth(), professionalController.applayJob);

router.get('/professional-past-job', auth(), professionalController.professionalrGetPastJob);

router.get('/professional-csv-repot', auth(), professionalController.professionalCsvRepot);

module.exports = router;
