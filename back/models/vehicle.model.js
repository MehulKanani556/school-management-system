const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    registrationNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'Electric', 'CNG'], default: 'Diesel' },
    insuranceExpiry: { type: Date },
    lastServiceDate: { type: Date },
    maintenanceHistory: [{
      date: { type: Date, default: Date.now },
      serviceType: { type: String },
      cost: { type: Number },
      notes: { type: String }
    }],
    status: { 
      type: String, 
      enum: ['active', 'maintenance', 'inactive'], 
      default: 'active' 
    },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  },
  { timestamps: true }
);

vehicleSchema.index({ schoolId: 1, registrationNumber: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
