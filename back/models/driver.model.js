const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    emergencyContact: { type: String, trim: true },
    performanceRating: { type: Number, default: 5, min: 1, max: 5 },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'on-leave'], 
      default: 'active' 
    },
  },
  { timestamps: true }
);

driverSchema.index({ schoolId: 1, licenseNumber: 1 }, { unique: true });

module.exports = mongoose.model('Driver', driverSchema);
