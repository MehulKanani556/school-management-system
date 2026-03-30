const Driver = require('../models/driver.model');
const Route = require('../models/route.model');
const TripLog = require('../models/tripLog.model');
const Vehicle = require('../models/vehicle.model');
const StaffAttendance = require('../models/staffAttendance.model');
const Leave = require('../models/leave.model'); // Added Leave model
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
            // If already completed, return error or handle accordingly
            if (existingTrip.status === 'Completed') {
                return res.status(400).json({ message: 'This trip has already been completed for today.' });
            }

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

        // Check for existing trip to avoid 11000 duplicate key error and allow resumption
        const start = new Date(tripData.date); start.setHours(0, 0, 0, 0);
        const end = new Date(tripData.date); end.setHours(23, 59, 59, 999);

        const existingLog = await TripLog.findOne({
            schoolId,
            routeId: tripData.routeId,
            type: tripData.type,
            date: { $gte: start, $lte: end }
        });

        if (existingLog) {
            return res.status(200).json({ message: 'Found existing trip log.', data: existingLog });
        }

        const log = await TripLog.create(tripData);

        // Notify Transport Managers & Socket Clients
        const { getIo } = require('../socketManager/socketManager');
        const io = getIo();
        if (io) {
            io.to("fleet_management").emit("trip_started", {
                tripId: log._id,
                driverName: req.user.firstName,
                routeName: req.body.routeName || 'Active Route',
                vehicleId: log.vehicleId
            });
        }

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
        res.status(500).json({ message: err.message });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const attendance = await StaffAttendance.find({
            userId: req.user._id,
            schoolId: getSchoolId(req)
        }).sort({ date: -1 }).limit(100); // Increased limit for calendar
        res.json(attendance);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markAttendance = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const schoolId = getSchoolId(req);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check for existing
        const existing = await StaffAttendance.findOne({
            schoolId,
            userId: req.user._id,
            date: today
        });

        if (existing) {
            return res.status(400).json({ message: 'Attendance already registered for today. (आज की हाजिरी दर्ज है)' });
        }

        const now = new Date();
        const arrivalTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Late threshold check (e.g., 7:30 AM as per policy message in frontend)
        const threshold = new Date(today);
        threshold.setHours(7, 30, 0, 0);
        const isLate = now > threshold;

        const record = await StaffAttendance.create({
            schoolId,
            userId: req.user._id,
            date: today,
            status: status || 'Present',
            arrivalTime,
            isLate,
            remarks: remarks || (isLate ? 'Late Arrival' : 'On Time')
        });

        res.status(201).json({ message: 'Attendance marked successfully', data: record });
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

exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const driver = await getDriverDoc(req);
        if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

        const leave = await Leave.create({
            schoolId: driver.schoolId,
            driverId: driver._id,
            type, startDate, endDate, reason
        });

        // Notify Transport Managers
        const transporters = await User.find({ schoolId: driver.schoolId, role: 'Transport_Manager' });
        for (const t of transporters) {
            await nc.sendNotification({
                schoolId: driver.schoolId,
                recipient: t._id,
                sender: req.user._id,
                type: 'Leave',
                title: 'Driver Leave Application',
                message: `Driver ${req.user.firstName} has applied for leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
                link: '/transporter/leaves'
            });
        }

        res.status(201).json({ message: 'Leave application submitted successfully', leave });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const driver = await getDriverDoc(req);
        if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

        const leaves = await Leave.find({ driverId: driver._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

