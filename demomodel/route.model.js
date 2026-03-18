const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, required: true },
    estimatedTime: { type: String },
  },
  { _id: false }
);

const assignedStudentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    pickupStop: { type: String },
    dropoffStop: { type: String },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true, trim: true },
    stops: [stopSchema],
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedStudents: [assignedStudentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
