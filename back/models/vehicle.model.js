const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    registrationNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    driverName: { type: String, trim: true },
    driverContact: { type: String, trim: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ schoolId: 1, registrationNumber: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
