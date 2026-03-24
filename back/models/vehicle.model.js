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
    fuelLogs: [{
      date: { type: Date, default: Date.now },
      fuelQuantity: { type: Number }, // in liters/gallons
      cost: { type: Number },
      odometerReading: { type: Number },
      notes: { type: String }
    }],
    insuranceRenewals: [{
      renewalDate: { type: Date },
      expiryDate: { type: Date },
      amount: { type: Number },
      policyNumber: { type: String },
      provider: { type: String }
    }],
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date }
    },
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
