const Driver = require('../models/driver.model');
const Route = require('../models/route.model');
const TripLog = require('../models/tripLog.model');
const Vehicle = require('../models/vehicle.model');
const StaffAttendance = require('../models/staffAttendance.model');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const nc = require('./notification.controller');

const getSchoolId = (req) => req.user.schoolId;

// Helper to get Driver document for current User
const getDriverDoc = async (req) => {
    return await Driver.findOne({ userId: req.user._id, schoolId: getSchoolId(req) });
};

exports.getDriverProfile = async (req, res) => {
    try {
        const driver = await getDriverDoc(req);
        if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
        
        // Also find assigned vehicle
        const vehicle = await Vehicle.findOne({ driverId: driver._id, schoolId: getSchoolId(req) });
        
        res.json({ driver, vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyRoutes = async (req, res) => {
    try {
        const driver = await getDriverDoc(req);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        // A driver might be assigned to a route directly or via a vehicle
        const vehicle = await Vehicle.findOne({ driverId: driver._id, schoolId: getSchoolId(req) });
        
        const routes = await Route.find({ 
            schoolId: getSchoolId(req),
            $or: [
                { vehicleId: vehicle?._id },
                { 'vehicleId.driverId': driver._id } // If populated logic needed later
            ]
        }).populate('vehicleId').populate('assignedStudents.studentId', 'firstName lastName admissionNumber');

        res.json(routes);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyTrips = async (req, res) => {
    try {
        const driver = await getDriverDoc(req);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        const { date } = req.query;
        let query = { schoolId: getSchoolId(req), driverId: driver._id };

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        const logs = await TripLog.find(query)
            .populate('routeId')
            .populate('vehicleId')
            .populate('attendance.studentId', 'firstName lastName')
            .sort({ date: -1 });
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.startTrip = async (req, res) => {
    try {
        const driver = await getDriverDoc(req);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        const { routeId, type, date } = req.body;
        const schoolId = getSchoolId(req);

        // Check if a trip already exists for this specific combination to avoid duplicate key error
        const existingTrip = await TripLog.findOne({
            schoolId,
            routeId,
            type,
            date: new Date(date)
        });

        if (existingTrip) {
            return res.status(200).json({ 
                message: 'Trip already exists for this slot. Resuming...', 
                data: existingTrip 
            });
        }

        const tripData = { 
            ...req.body, 
            schoolId, 
            driverId: driver._id,
            status: 'In-Progress',
            actualDepartureTime: new Date()
        };

        const log = await TripLog.create(tripData);
        
        // Notify Transport Managers
        const transporters = await User.find({ schoolId: tripData.schoolId, role: 'Transport_Manager' });
        for (const t of transporters) {
            await nc.sendNotification({
                schoolId: tripData.schoolId,
                recipient: t._id,
                sender: req.user._id,
                type: 'Transport',
                title: 'Trip Commenced',
                message: `Driver ${req.user.firstName} has started a trip for route: ${req.body.routeName || 'Active Route'}.`,
                link: '/transporter/tracking'
            });
        }

        res.status(201).json({ message: 'Trip started successfully', data: log });
    } catch (err) { 
        if (err.code === 11000) {
            return res.status(409).json({ message: 'This trip has already been started.' });
        }
        res.status(500).json({ message: err.message }); 
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const attendance = await StaffAttendance.find({
            userId: req.user._id,
            schoolId: getSchoolId(req)
        }).sort({ date: -1 }).limit(30);
        res.json(attendance);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.reportBusIssue = async (req, res) => {
    try {
        const { vehicleId, title, description, priority } = req.body;
        const driver = await getDriverDoc(req);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        const vehicle = await Vehicle.findOne({ _id: vehicleId, schoolId: getSchoolId(req) });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        vehicle.maintenanceHistory.push({
            date: new Date(),
            serviceType: `Driver Reported: ${title}`,
            notes: `[Priority: ${priority}] ${description}`,
            cost: 0
        });

        const oldStatus = vehicle.status;
        vehicle.status = priority === 'High' ? 'maintenance' : vehicle.status;
        await vehicle.save();

        // Notify Transport Managers
        const transporters = await User.find({ schoolId: getSchoolId(req), role: 'Transport_Manager' });
        for (const t of transporters) {
            await nc.sendNotification({
                schoolId: getSchoolId(req),
                recipient: t._id,
                sender: req.user._id,
                type: 'Transport',
                title: 'Bus Problem Reported',
                message: `Driver ${req.user.firstName} reported an issue for bus ${vehicle.registrationNumber}: ${title} [Priority: ${priority}]`,
                link: '/transporter/Maintenance'
            });
        }

        res.json({ message: 'Issue reported to transport manager', data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
