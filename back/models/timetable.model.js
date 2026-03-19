const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
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
          subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
          teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
          room: { type: String }
        }
      ]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
