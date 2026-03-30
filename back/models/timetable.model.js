const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  standardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard', required: true },
  classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true, unique: true },
  schedule: [
    {
      day: { 
        type: String, 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
        required: true 
      },
      periods: [
        {
          startTime: { type: String, required: true }, // e.g. "09:00"
          endTime: { type: String, required: true },   // e.g. "09:45"
          type: { type: String, enum: ['Lecture', 'Break', 'Short Break', 'Long Break'], default: 'Lecture' },
          subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
          teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
          room: { type: String }
        }
      ]
    }
  ],
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
