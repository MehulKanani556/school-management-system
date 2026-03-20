const mongoose = require('mongoose');

const timetableTemplateSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  periods: [
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      type: { type: String, enum: ['Lecture', 'Break', 'Short Break', 'Long Break'], default: 'Lecture' }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('TimetableTemplate', timetableTemplateSchema);
