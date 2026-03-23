const mongoose = require('mongoose');

const promotionHistorySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    fromStandard: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard' },
    toStandard: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard' },
    fromAcademicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    toAcademicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    promotedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    promotionDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['Promoted', 'Demoted', 'Detained', 'Graduated'], 
      default: 'Promoted' 
    },
    remarks: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromotionHistory', promotionHistorySchema);
