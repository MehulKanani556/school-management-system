const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic: { type: String, required: true },
  subTopics: [{ type: String }],
  date: { type: Date, required: true },
  objectives: { type: String },
  resources: [{ type: String }],
  status: { type: String, enum: ['Draft', 'Published', 'Completed'], default: 'Draft' },
}, { timestamps: true });

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);
