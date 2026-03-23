const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  boarded: { type: Boolean, default: false },
  boardingTime: { type: Date },
}, { _id: false });

const tripLogSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    date: { type: Date, required: true },
    type: { type: String, enum: ['Pickup', 'Dropoff'], required: true },
    status: { type: String, enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'], default: 'Scheduled' },
    actualDepartureTime: { type: Date },
    arrivalTime: { type: Date },
    delayReason: { type: String },
    attendance: [attendanceRecordSchema],
  },
  { timestamps: true }
);

tripLogSchema.index({ schoolId: 1, date: 1, routeId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('TripLog', tripLogSchema);
