const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // School Admin
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
