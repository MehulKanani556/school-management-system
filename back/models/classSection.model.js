const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  
  // Grade Level (represents the "Standard")
  gradeLevel: { type: Number, required: true, min: 1, max: 12 },
  
  // Classroom (represents the "Section" e.g., A, B, C)
  sectionLabel: { type: String, required: true },
  
  // Class Teacher (Particular teacher for this specific room)
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  
  // Optional: List of teachers assigned to specific subjects in this room
  subjectAssignments: [{
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
  }],
  
  // Standard list of subjects for this grade
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
}, { timestamps: true });

// Ensure Grade + Section is unique for each school (e.g., Only one "Grade 1-A")
classSectionSchema.index({ schoolId: 1, gradeLevel: 1, sectionLabel: 1 }, { unique: true });

// Ensure a teacher is only a Class Teacher for one classroom at a time
classSectionSchema.index({ schoolId: 1, classTeacher: 1 }, { unique: true });

module.exports = mongoose.model('ClassSection', classSectionSchema);
