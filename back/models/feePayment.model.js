const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  category: { type: String, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue', 'partially_paid'], default: 'pending' },
  dueDate: { type: Date },
  paidDate: { type: Date },
  academicYear: { type: String },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
}, { timestamps: true });

feePaymentSchema.index({ schoolId: 1, studentId: 1, category: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
