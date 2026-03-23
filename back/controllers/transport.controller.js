const Vehicle = require('../models/vehicle.model');
const Route = require('../models/route.model');
const Student = require('../models/student.model');
const mongoose = require('mongoose');

const getSchoolId = (req) => req.user.schoolId;

// Vehicle CRUD
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ schoolId: getSchoolId(req) }).sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create({ ...req.body, schoolId: getSchoolId(req) });
        res.status(201).json({ message: 'Vehicle added successfully', data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: req.params.id, schoolId: getSchoolId(req) },
            req.body, { new: true }
        );
        res.json({ message: 'Vehicle updated', data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteVehicle = async (req, res) => {
    try {
        await Vehicle.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
        res.json({ message: 'Vehicle deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Route CRUD
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find({ schoolId: getSchoolId(req) })
            .populate('vehicleId')
            .populate('assignedStudents.studentId', 'firstName lastName admissionNumber');
        res.json(routes);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addRoute = async (req, res) => {
    try {
        const route = await Route.create({ ...req.body, schoolId: getSchoolId(req) });
        res.status(201).json({ message: 'Route created', data: route });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateRoute = async (req, res) => {
    try {
        const route = await Route.findOneAndUpdate(
            { _id: req.params.id, schoolId: getSchoolId(req) },
            req.body, { new: true }
        ).populate('vehicleId');
        res.json({ message: 'Route updated', data: route });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteRoute = async (req, res) => {
    try {
        await Route.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
        res.json({ message: 'Route deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.assignStudent = async (req, res) => {
    try {
        const { studentId, pickupStop, dropoffStop } = req.body;
        const schoolId = getSchoolId(req);
        
        const route = await Route.findOne({ _id: req.params.id, schoolId });
        if (!route) return res.status(404).json({ message: 'Route not found' });

        // Check if student already assigned to this route
        const index = route.assignedStudents.findIndex(s => s.studentId.toString() === studentId);
        if (index !== -1) {
            route.assignedStudents[index] = { studentId, pickupStop, dropoffStop };
        } else {
            route.assignedStudents.push({ studentId, pickupStop, dropoffStop });
        }

        await route.save();

        // Notify Parent
        const student = await Student.findById(studentId);
        if (student && student.parentId) {
            const nc = require('./notification.controller');
            await nc.sendNotification({
                schoolId,
                recipient: student.parentId,
                sender: req.user._id,
                type: 'Transport',
                title: 'Transport Logistics Synchronized',
                message: `Transport route assignments for ${student.firstName} have been dynamically updated in the central registry.`,
                link: '/parent/transport'
            });
        }

        res.json({ message: 'Student assigned to route successfully', data: route });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
