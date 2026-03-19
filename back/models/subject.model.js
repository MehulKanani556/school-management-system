const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  code: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
