const express = require('express');
const router = express.Router();
const gpsController = require('../controllers/gps.controller');

// Standard endpoint for hardware trackers
// Usage: http://host/api/gps/update?id=BUS-01&lat=23.01&lon=72.03
router.get('/update', gpsController.handleGpsUpdate);
router.post('/update', gpsController.handleGpsUpdate);

module.exports = router;
