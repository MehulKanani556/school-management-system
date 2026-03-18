const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    registrationNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    driverName: { type: String, trim: true },
    driverContact: { type: String, trim: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ tenantId: 1, registrationNumber: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
