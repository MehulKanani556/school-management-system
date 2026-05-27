const Vehicle = require('../models/vehicle.model');
const Route = require('../models/route.model');
const Student = require('../models/student.model');
const Driver = require('../models/driver.model');
const TripLog = require('../models/tripLog.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { addAcademicYearFilter } = require('../utils/academicYearHelper');

const getSchoolId = (req) => req.user.schoolId;

async function syncTransportFeeForStudent({ schoolId, studentId, route, academicYearId }) {
    if (!route.fee || route.fee <= 0 || !academicYearId) return;
    const FeePayment = require('../models/feePayment.model');
    const feeQuery = addAcademicYearFilter({ studentId, category: 'Transport', schoolId }, academicYearId);
    const existingFee = await FeePayment.findOne(feeQuery);
    if (!existingFee) {
        await FeePayment.create({
            schoolId,
            studentId,
            amount: route.fee,
            totalAmount: route.fee,
            category: 'Transport',
            academicYearId,
            status: 'pending',
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        });
    }
}

// Vehicle CRUD
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ schoolId: getSchoolId(req) })
            .populate('driverId')
            .sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addVehicle = async (req, res) => {
    try {
        const { driverId } = req.body;
        const schoolId = getSchoolId(req);
        if (driverId) {
            const existing = await Vehicle.findOne({ driverId, schoolId });
            if (existing) {
                return res.status(400).json({ message: 'Driver is already assigned to another vehicle' });
            }
        }
        const vehicle = await Vehicle.create({ ...req.body, schoolId });
        res.status(201).json({ message: 'Vehicle added successfully', data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateVehicle = async (req, res) => {
    try {
        const { driverId } = req.body;
        const schoolId = getSchoolId(req);
        if (driverId) {
            const existing = await Vehicle.findOne({ driverId, schoolId, _id: { $ne: req.params.id } });
            if (existing) {
                return res.status(400).json({ message: 'Driver is already assigned to another vehicle' });
            }
        }
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body, { new: true }
        ).populate('driverId');
        res.json({ message: 'Vehicle updated', data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteVehicle = async (req, res) => {
    try {
        await Vehicle.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
        res.json({ message: 'Vehicle deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleVehicleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const schoolId = getSchoolId(req);

        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: id, schoolId },
            { $set: { status } },
            { new: true }
        ).populate('driverId');

        if (!vehicle) return res.status(404).json({ message: 'Vehicle unit not found' });

        res.json({ message: `Vehicle status shifted to ${status}`, data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.resolveMaintenanceRecord = async (req, res) => {
    try {
        const { id, recordId } = req.params;
        const { cost, notes } = req.body;
        const schoolId = getSchoolId(req);

        const vehicle = await Vehicle.findOne({ _id: id, schoolId });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle unit not found' });

        const record = vehicle.maintenanceHistory.id(recordId);
        if (!record) return res.status(404).json({ message: 'Service record not found' });

        record.cost = cost;
        record.notes = `${record.notes} [RESOLVED: ${notes || 'Repair Completed'}]`;
        record.date = new Date(); // Update to completion date

        await vehicle.save();
        const updated = await Vehicle.findById(id).populate('driverId');
        res.json({ message: 'Protocol completed and resolved', data: updated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Route CRUD
exports.getRoutes = async (req, res) => {
    try {
        let query = { schoolId: getSchoolId(req) };
        
        // If driver, only show their own routes
        if (req.user.role === 'Driver') {
            const driver = await Driver.findOne({ userId: req.user._id, schoolId: getSchoolId(req) });
            if (driver) {
                // Find vehicle assigned to this driver
                const vehicle = await Vehicle.findOne({ driverId: driver._id, schoolId: getSchoolId(req) });
                if (vehicle) {
                    query.vehicleId = vehicle._id;
                } else {
                    // No vehicle, no routes (or direct assignment)
                    query.vehicleId = null; 
                }
            } else {
                return res.status(404).json({ message: 'Driver profile not found' });
            }
        }

        const routes = await Route.find(query)
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

exports.unassignStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const schoolId = getSchoolId(req);

        const route = await Route.findOne({ _id: req.params.id, schoolId });
        if (!route) return res.status(404).json({ message: 'Route not found' });

        route.assignedStudents = route.assignedStudents.filter(s => s.studentId.toString() !== studentId);
        await route.save();

        // Update student logistical status
        await Student.findByIdAndUpdate(studentId, { transportStatus: 'None', transportRouteId: null });

        // Optional: Remove pending transport fee? 
        // (Usually keep for audit but we will let user decide or leave it)

        res.json({ message: 'Student removed from route', data: route });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getTransportApplicants = async (req, res) => {
    try {
        const students = await Student.find({
            schoolId: getSchoolId(req),
            transportStatus: { $in: ['Applied', 'Approved'] }
        }).populate('standard classSection');
        res.json(students);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rejectTransportApplication = async (req, res) => {
    try {
        const { studentId } = req.params;
        const schoolId = getSchoolId(req);

        const student = await Student.findOneAndUpdate(
            { _id: studentId, schoolId },
            { transportStatus: 'None', transportRouteId: null },
            { new: true }
        );

        if (!student) return res.status(404).json({ message: 'Student node not found' });

        // Notify Parent
        if (student.parentId) {
            const nc = require('./notification.controller');
            await nc.sendNotification({
                schoolId,
                recipient: student.parentId,
                sender: req.user._id,
                type: 'Transport',
                title: 'Transport Inquiry Update',
                message: `The institutional transport inquiry for ${student.firstName} has been declined at this time.`,
                link: '/parent/transport'
            });
        }

        res.json({ message: 'Transport application rejected', student });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.assignStudent = async (req, res) => {
    try {
        const { studentId, pickupStop, dropoffStop, seatNumber } = req.body;
        const schoolId = getSchoolId(req);

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const route = await Route.findOne({ _id: req.params.id, schoolId }).populate('vehicleId');
        if (!route) return res.status(404).json({ message: 'Route not found' });

        // 1. Capacity Validation
        if (route.vehicleId && route.assignedStudents.length >= route.vehicleId.capacity) {
            const isAlreadyAssigned = route.assignedStudents.some(s => s.studentId.toString() === studentId);
            if (!isAlreadyAssigned) {
                return res.status(400).json({ message: `Vehicle capacity reached (${route.vehicleId.capacity}).` });
            }
        }

        // 2. Conflict Validation (Seat Number)
        if (seatNumber) {
            const seatConflict = route.assignedStudents.some(s => 
                s.seatNumber?.toString() === seatNumber.toString() && 
                s.studentId.toString() !== studentId
            );
            if (seatConflict) {
                return res.status(400).json({ message: `Seat ${seatNumber} is already occupied by another student on this route.` });
            }
        }

        // 3. State Transformation
        const index = route.assignedStudents.findIndex(s => s.studentId.toString() === studentId);
        const assignmentData = { studentId, pickupStop, dropoffStop, seatNumber };

        if (index !== -1) {
            route.assignedStudents[index] = assignmentData;
        } else {
            route.assignedStudents.push(assignmentData);
        }

        await route.save();

        // 3. Logistical Status Finalization
        student.transportStatus = 'Active';
        student.transportRouteId = route._id;
        await student.save();

        if (!req.academicYearId) {
            return res.status(400).json({ message: 'Active academic year required to assign transport fees' });
        }
        await syncTransportFeeForStudent({
            schoolId,
            studentId,
            route,
            academicYearId: req.academicYearId,
        });

        // 5. Parent Uplink
        if (student.parentId) {
            const nc = require('./notification.controller');
            await nc.sendNotification({
                schoolId,
                recipient: student.parentId,
                sender: req.user._id,
                type: 'Transport',
                title: 'Logistics Approved & Assigned',
                message: `Transport for ${student.firstName} is now ACTIVE on route: ${route.name}. Base fee: ₹${route.fee} added to ledger.`,
                link: '/parent/transport'
            });
        }

        res.json({ message: 'Student assigned and fee synchronized', data: route });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Maintenance Tracking
exports.addMaintenanceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceType, cost, notes, date } = req.body;
        const schoolId = getSchoolId(req);

        const vehicle = await Vehicle.findOne({ _id: id, schoolId });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle unit not found' });

        vehicle.maintenanceHistory.push({
            date: date || new Date(),
            serviceType,
            cost,
            notes
        });
        vehicle.lastServiceDate = date || new Date();

        await vehicle.save();
        const updated = await Vehicle.findById(id).populate('driverId');
        res.json({ message: 'Maintenance record synthesized', data: updated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addFuelLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, fuelQuantity, cost, odometerReading, notes } = req.body;
        const schoolId = getSchoolId(req);

        const vehicle = await Vehicle.findOne({ _id: id, schoolId });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle unit not found' });

        vehicle.fuelLogs.push({
            date: date || new Date(),
            fuelQuantity,
            cost,
            odometerReading,
            notes
        });

        await vehicle.save();
        res.json({ message: 'Fuel allocation logged', data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addInsuranceRenewal = async (req, res) => {
    try {
        const { id } = req.params;
        const { renewalDate, expiryDate, amount, policyNumber, provider } = req.body;
        const schoolId = getSchoolId(req);

        const vehicle = await Vehicle.findOne({ _id: id, schoolId });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle unit not found' });

        vehicle.insuranceRenewals.push({
            renewalDate: renewalDate || new Date(),
            expiryDate,
            amount,
            policyNumber,
            provider
        });
        vehicle.insuranceExpiry = expiryDate;

        await vehicle.save();
        res.json({ message: 'Insurance matrix updated', data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateVehicleLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;
        const schoolId = getSchoolId(req);

        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: id, schoolId },
            {
                $set: {
                    'currentLocation.lat': lat,
                    'currentLocation.lng': lng,
                    'currentLocation.updatedAt': new Date()
                }
            },
            { new: true }
        );

        // Notify socket subscribers
        const { vehicleLocationMap, getIo } = require('../socketManager/socketManager');
        const io = getIo();
        if (io) {
            const updatePayload = { vehicleId: id, lat, lng, updatedAt: new Date() };
            vehicleLocationMap.set(id.toString(), updatePayload);
            io.to(`vehicle_${id}`).emit("vehicle_location_updated", updatePayload);
            io.to("fleet_management").emit("fleet_location_updated", updatePayload);
        }

        res.json({ message: 'Coordinate uplink successful', data: vehicle });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Driver CRUD
exports.getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({ schoolId: getSchoolId(req) }).populate('userId').sort({ createdAt: -1 });
        res.json(drivers);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addDriver = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const { email, password, baseSalary, name, contact } = req.body;

        let userId = null;
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: 'A user with this email already exists' });

            const hashedPassword = await bcrypt.hash(password || email, 10);
            const user = await User.create({
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || 'Driver',
                email,
                password: hashedPassword,
                role: 'Driver',
                schoolId,
                phoneNumber: contact,
                baseSalary: Number(baseSalary) || 0
            });
            userId = user._id;
        }

        const driver = await Driver.create({ ...req.body, schoolId, userId });
        const populatedDriver = await Driver.findById(driver._id).populate('userId');
        res.status(201).json({ message: 'Driver added and account provisioned', data: populatedDriver });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateDriver = async (req, res) => {
    try {
        const { email, baseSalary, name, contact } = req.body;
        const schoolId = getSchoolId(req);
        
        const driver = await Driver.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            req.body, { new: true }
        );

        if (driver && driver.userId) {
            const userUpdate = {
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || 'Driver',
                phoneNumber: contact,
            };
            if (email) userUpdate.email = email;
            if (baseSalary !== undefined && baseSalary !== '') {
                userUpdate.baseSalary = Number(baseSalary);
            }
            await User.findByIdAndUpdate(driver.userId, userUpdate);
        }

        const populatedDriver = await Driver.findById(req.params.id).populate('userId');
        res.json({ message: 'Driver and linked account updated', data: populatedDriver });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteDriver = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const driver = await Driver.findOneAndDelete({ _id: req.params.id, schoolId });
        if (driver && driver.userId) {
            await User.findOneAndDelete({ _id: driver.userId, schoolId });
        }
        res.json({ message: 'Driver and linked personnel record deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Trip Log Management
exports.getTripLogs = async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;
        let query = { schoolId: getSchoolId(req) };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        } else if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        const logs = await TripLog.find(query)
            .populate('routeId')
            .populate('vehicleId')
            .populate('driverId')
            .populate('attendance.studentId', 'firstName lastName')
            .sort({ date: -1 });
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.recordTrip = async (req, res) => {
    try {
        const tripData = { ...req.body, schoolId: getSchoolId(req) };
        if (tripData.driverId === '') delete tripData.driverId;
        if (tripData.vehicleId === '') delete tripData.vehicleId;
        if (tripData.status === 'In-Progress') {
            tripData.actualDepartureTime = new Date();
        }
        const log = await TripLog.create(tripData);
        res.status(201).json({ message: 'Trip recorded', data: log });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTripStatus = async (req, res) => {
    try {
        const { status, delayReason } = req.body;
        const schoolId = getSchoolId(req);
        const update = { status };

        if (status === 'In-Progress') update.actualDepartureTime = new Date();
        if (status === 'Completed') {
            update.arrivalTime = new Date();
            if (delayReason) update.delayReason = delayReason;
        }
        if (status === 'Cancelled') update.status = 'Cancelled';

        const log = await TripLog.findOneAndUpdate(
            { _id: req.params.id, schoolId },
            { $set: update },
            { new: true }
        ).populate('routeId').populate('vehicleId').populate('driverId').populate('attendance.studentId', 'firstName lastName');

        // Notify socket subscribers
        const { getIo } = require('../socketManager/socketManager');
        const io = getIo();
        if (io) {
            io.to("fleet_management").emit("trip_updated", { 
                tripId: log._id, 
                status: log.status,
                route: log.routeId?.name,
                vehicleId: log.vehicleId?._id
            });
        }

        res.json({ message: `Transit sequence transition: ${status}`, data: log });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleBoarding = async (req, res) => {
    try {
        const { studentId, boarded } = req.body;
        const schoolId = getSchoolId(req);

        const log = await TripLog.findOne({ _id: req.params.id, schoolId });
        if (!log) return res.status(404).json({ message: 'Trip not found' });

        const record = log.attendance.find(a => a.studentId.toString() === studentId);
        if (!record) return res.status(404).json({ message: 'Student not in trip attendance' });

        record.boarded = boarded;
        record.boardingTime = boarded ? new Date() : null;

        await log.save();

        const updatedLog = await TripLog.findById(log._id)
            .populate('routeId').populate('vehicleId').populate('driverId').populate('attendance.studentId', 'firstName lastName');

        res.json({ message: boarded ? 'Student boarded' : 'Boarding removed', data: updatedLog });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getTransportAnalytics = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);

        const vehicles = await Vehicle.find({ schoolId });
        const drivers = await Driver.find({ schoolId });
        const routes = await Route.find({ schoolId });
        const students = await Student.find({ schoolId, deletedAt: null, isActive: true });

        // Fleet Telemetry
        const vehicleStats = {
            total: vehicles.length,
            active: vehicles.filter(v => v.status === 'active').length,
            maintenance: vehicles.filter(v => v.status === 'maintenance').length,
            totalMaintenanceCost: vehicles.reduce((acc, v) => acc + (v.maintenanceHistory?.reduce((s, h) => s + (h.cost || 0), 0) || 0), 0)
        };

        // Operator Performance
        const driverStats = {
            total: drivers.length,
            avgRating: drivers.length ? (drivers.reduce((acc, d) => acc + (d.performanceRating || 0), 0) / drivers.length).toFixed(1) : 0
        };

        // Entity Displacement
        const totalAssigned = routes.reduce((acc, r) => acc + r.assignedStudents.length, 0);
        const transportStats = {
            totalStudents: students.length,
            assigned: totalAssigned,
            unassigned: Math.max(0, students.length - totalAssigned)
        };

        // Recently Finalized Sequences
        const recentTrips = await TripLog.find({ schoolId, status: 'Completed' })
            .limit(10)
            .sort({ date: -1 });

        const delayMetric = recentTrips.length ? (recentTrips.filter(t => t.delayReason).length / recentTrips.length * 100).toFixed(0) : 0;

        res.json({
            fleet: vehicleStats,
            operators: driverStats,
            logistics: transportStats,
            efficiency: { delayRate: delayMetric }
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.bulkAssignStudents = async (req, res) => {
    try {
        const { routeId, studentIds, pickupStop, dropoffStop } = req.body;
        const schoolId = getSchoolId(req);

        const route = await Route.findOne({ _id: routeId, schoolId }).populate('vehicleId');
        if (!route) return res.status(404).json({ message: 'Route matrix not found' });

        // Capacity Validation
        const currentCount = route.assignedStudents.length;
        const newUnassigned = studentIds.filter(id => !route.assignedStudents.some(as => as.studentId.toString() === id));
        if (route.vehicleId && (currentCount + newUnassigned.length) > route.vehicleId.capacity) {
            return res.status(400).json({ message: `Bulk allocation exceeds unit capacity (${route.vehicleId.capacity}). Current: ${currentCount}, Requested New: ${newUnassigned.length}` });
        }

        if (!req.academicYearId) {
            return res.status(400).json({ message: 'Active academic year required for bulk transport assignment' });
        }

        const nc = require('./notification.controller');
        for (const studentId of studentIds) {
            const index = route.assignedStudents.findIndex(s => s.studentId.toString() === studentId);
            if (index !== -1) {
                route.assignedStudents[index] = { studentId, pickupStop, dropoffStop };
            } else {
                route.assignedStudents.push({ studentId, pickupStop, dropoffStop });
            }

            const student = await Student.findById(studentId);
            if (student) {
                student.transportStatus = 'Active';
                student.transportRouteId = route._id;
                await student.save();
                await syncTransportFeeForStudent({
                    schoolId,
                    studentId,
                    route,
                    academicYearId: req.academicYearId,
                });
                if (student.parentId) {
                    await nc.sendNotification({
                        schoolId,
                        recipient: student.parentId,
                        sender: req.user._id,
                        type: 'Transport',
                        title: 'Bulk transport assignment',
                        message: `${student.firstName} was assigned to route ${route.name}.`,
                        link: '/parent/transport',
                    });
                }
            }
        }

        await route.save();
        const updated = await Route.findById(routeId).populate('vehicleId').populate('assignedStudents.studentId', 'firstName lastName admissionNumber');
        res.json({ message: 'Bulk assignment synthesized successfully', data: updated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
