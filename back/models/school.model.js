const mongoose = require('mongoose');

const gradingScaleEntrySchema = new mongoose.Schema(
  {
    grade: { type: String, required: true },
    minPercent: { type: Number, required: true },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    emailNotifications: { type: Boolean, default: false },
    smsNotifications: { type: Boolean, default: false },
    gradingScale: { type: [gradingScaleEntrySchema], default: [] },
    libraryFinePerDay: { type: Number, default: 0 },
    paymentGateway: { type: String },
  },
  { _id: false }
);

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subdomain: { type: String, required: true, unique: true },
    logo: { type: String }, // NEW
    adminEmail: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    revenue: { // To track global revenue in stats
        type: Number,
        default: 0
    },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('School', schoolSchema);
