const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    enrollmentDate: { type: Date },
    status: {
      type: String,
      enum: ['active', 'promoted', 'transferred', 'withdrawn'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admission', admissionSchema);
