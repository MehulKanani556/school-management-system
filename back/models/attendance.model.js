const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  standardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard', required: true },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
  date: { type: Date, required: true },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-Day'], default: 'Present' },
    arrivalTime: { type: String },
    departureTime: { type: String },
    isLate: { type: Boolean, default: false },
    isEarlyLeave: { type: Boolean, default: false },
    remarks: { type: String }
  }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
