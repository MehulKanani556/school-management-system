const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Optional for class-wide meetings
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' }, // NEW: For whole class PTMs
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  meetingLink: { type: String },
  meetingType: { type: String, enum: ['Physical', 'Virtual'], default: 'Physical' },
  scope: { type: String, enum: ['Individual', 'Class'], default: 'Individual' }, // NEW: To distinguish scope
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
