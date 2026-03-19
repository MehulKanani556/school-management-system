const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  baseSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  paymentDate: { type: Date },
  remarks: { type: String },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
