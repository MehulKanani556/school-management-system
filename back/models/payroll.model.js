const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, // Optional for non-teacher staff
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Mandatory for staff without Teacher record
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  paidAt: { type: Date },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Online'] },
  transactionId: { type: String },
  remarks: { type: String },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
