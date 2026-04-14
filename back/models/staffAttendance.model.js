const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-Day', 'Leave'], default: 'Present' },
  arrivalTime: { type: String },
  departureTime: { type: String },
  isLate: { type: Boolean, default: false },
  remarks: { type: String }
}, { timestamps: true });

staffAttendanceSchema.index({ schoolId: 1, academicYearId: 1, date: 1, teacherId: 1, userId: 1, driverId: 1 }, { unique: true });
staffAttendanceSchema.index({ schoolId: 1, academicYearId: 1, date: 1 }); // Performance index for quick daily lookups

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
