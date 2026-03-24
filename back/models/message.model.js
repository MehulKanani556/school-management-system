const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Specific student/parent/user
  type: { type: String, enum: ['Announcement', 'DirectMessage', 'Notice'], default: 'Announcement' },
  targetRole: { type: String, enum: ['Student', 'Parent', 'Teacher', 'All', 'Specific'] }, // Broad message or specific
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' }, // Message for a specific class
  subject: { type: String, required: true },
  content: { type: String, required: true },
  fileUrl: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
