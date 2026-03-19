const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  
  // Link to the Parent Standard (Grade Level)
  standardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard', required: true },
  
  // Section Label (Classroom e.g., A, B, C)
  sectionLabel: { type: String, required: true },
  
  // Particular Class Teacher for this section
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  
  // Teachers assigned to specific subjects in this particular room
  subjectAssignments: [{
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }]
  }],

  // Cached subjects for this room (inherited from Standard but can be modified)
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
}, { timestamps: true });

// Ensure Standard + Section combo is unique per school (e.g., Only one "Standard 1 - A")
classSectionSchema.index({ schoolId: 1, standardId: 1, sectionLabel: 1 }, { unique: true });

// Ensure a teacher is only a Class Teacher for one section at a time
classSectionSchema.index({ schoolId: 1, classTeacher: 1 }, { unique: true });

module.exports = mongoose.model('ClassSection', classSectionSchema);
