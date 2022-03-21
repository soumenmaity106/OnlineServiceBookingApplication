const express = require('express');

const dashbaordController = require('../../controllers/dashbaord.controller');

const router = express.Router();

router.get('/getdashbaord', dashbaordController.getDashbaord);

module.exports = router;
