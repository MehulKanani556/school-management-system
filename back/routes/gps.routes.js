const express = require('express');
const router = express.Router();
const gpsController = require('../controllers/gps.controller');
const Vehicle = require('../models/vehicle.model');

// GPS API Key validation middleware
// Hardware trackers must pass ?apiKey=<vehicle.gpsApiKey> in the request
const validateGpsApiKey = async (req, res, next) => {
    try {
        const deviceId = req.query.id || req.body.deviceId;
        const apiKey = req.query.apiKey || req.body.apiKey;

        if (!deviceId) return res.status(400).send('MISSING_DEVICE_ID');
        if (!apiKey) return res.status(401).send('MISSING_API_KEY');

        const vehicle = await Vehicle.findOne({ gpsDeviceId: deviceId }).select('gpsApiKey');
        if (!vehicle) return res.status(404).send('DEVICE_NOT_REGISTERED');
        if (!vehicle.gpsApiKey || vehicle.gpsApiKey !== apiKey) return res.status(403).send('INVALID_API_KEY');

        next();
    } catch (err) {
        res.status(500).send('AUTH_FAULT');
    }
};

// Standard endpoint for hardware trackers
// Usage: http://host/api/gps/update?id=BUS-01&lat=23.01&lon=72.03&apiKey=<key>
router.get('/update', validateGpsApiKey, gpsController.handleGpsUpdate);
router.post('/update', validateGpsApiKey, gpsController.handleGpsUpdate);

module.exports = router;
