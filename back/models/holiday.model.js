const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);
