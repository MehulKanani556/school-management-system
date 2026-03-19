const mongoose = require('mongoose');

const standardSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  
  // Grade Level (1, 2, 3... 12)
  level: { type: Number, required: true },
  
  // Optional descriptive name (e.g., "Primary 1", "Senior Secondary")
  name: { type: String },
  
  // Default subjects for this standard level
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
}, { timestamps: true });

// Ensure unique level per school
standardSchema.index({ schoolId: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('Standard', standardSchema);
