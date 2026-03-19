const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gradeLevel: { type: Number, required: true, min: 1, max: 12 },
  sectionLabel: { type: String, required: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  assignedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
  subjects: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('ClassSection', classSectionSchema);
