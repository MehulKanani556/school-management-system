const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Announcement', 'DirectMessage', 'Notice'], default: 'Announcement' },
  targetRole: { type: String, enum: ['Student', 'Parent', 'Teacher', 'Accountant', 'Librarian', 'Transport_Manager', 'All', 'Specific'] },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  fileUrl: { type: String },
  isRead: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
