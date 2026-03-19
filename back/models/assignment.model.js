const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  fileUrl: { type: String },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
