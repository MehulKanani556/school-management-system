const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      required: true,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    date: { type: Date, required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    records: [attendanceRecordSchema],
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attendanceSchema.index({ tenantId: 1, classSectionId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
