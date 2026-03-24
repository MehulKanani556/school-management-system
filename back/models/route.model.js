const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, required: true },
    estimatedTime: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const assignedStudentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    pickupStop: { type: String },
    dropoffStop: { type: String },
    seatNumber: { type: Number },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    stops: [stopSchema],
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedStudents: [assignedStudentSchema],
    fee: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
