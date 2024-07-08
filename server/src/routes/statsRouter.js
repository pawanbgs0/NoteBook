const express = require('express');

const {
    getAllStats,
    getDailyStats,
    getYearlyStats
} = require('../controllers/statsController');

const router = express.Router();

router.route('').get(getAllStats);
router.route('/daily').get(getDailyStats);
router.route('/yearly').get(getYearlyStats);

module.exports = router;