const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['sick', 'casual', 'maternity', 'paternity', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  actionedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
