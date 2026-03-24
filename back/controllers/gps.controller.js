const Vehicle = require('../models/vehicle.model');
const { vehicleLocationMap, getIo } = require('../socketManager/socketManager');

/**
 * GPS Hardware Gateway
 * Handles incoming coordinates from bus-mounted GPS hardware.
 * Supports standard HTTP GET/POST formats used by most trackers.
 */
exports.handleGpsUpdate = async (req, res) => {
    try {
        // Support both query params (GET) and body (POST)
        const deviceId = req.query.id || req.body.deviceId;
        const lat = parseFloat(req.query.lat || req.body.lat);
        const lng = parseFloat(req.query.lon || req.query.lng || req.body.lon || req.body.lng);
        const speed = parseFloat(req.query.speed || req.body.speed || 0);
        const heading = parseFloat(req.query.bearing || req.query.heading || req.body.heading || 0);
        
        if (!deviceId || isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ status: 'ERROR', message: 'Incomplete coordinate packet.' });
        }

        // Find the vehicle associated with this hardware ID
        const vehicle = await Vehicle.findOne({ gpsDeviceId: deviceId });
        if (!vehicle) {
            return res.status(404).json({ status: 'ERROR', message: 'Hardware ID not registered in transport sector.' });
        }

        const updatedAt = new Date();
        const updatePayload = { 
            vehicleId: vehicle._id.toString(), 
            lat, 
            lng, 
            speed, 
            heading, 
            updatedAt,
            vehicleNumber: vehicle.registrationNumber
        };

        // 1. Update In-Memory Cache for Socket Subscriptions
        vehicleLocationMap.set(vehicle._id.toString(), updatePayload);

        // 2. Broadcast to Live Terminals (Parents/Admins)
        const io = getIo();
        if (io) {
            io.to(`vehicle_${vehicle._id}`).emit("vehicle_location_updated", updatePayload);
            io.to("fleet_management").emit("fleet_location_updated", updatePayload);
        }

        // 3. Optional: Persistent update in Batch (Throttle DB Writes)
        // For hardware, we often update DB only every 30-60 secs to avoid burnout, 
        // but keep socket updates real-time.
        if (!vehicle.currentLocation?.updatedAt || (updatedAt - vehicle.currentLocation.updatedAt > 30000)) {
            vehicle.currentLocation = { lat, lng, updatedAt };
            await vehicle.save();
        }

        // Send Ack conformant to common GPS tracker protocols (HTTP 200)
        res.status(200).send('OK');
        
    } catch (err) {
        console.error('GPS Gateway Fault:', err);
        res.status(500).send('FAULT');
    }
};
