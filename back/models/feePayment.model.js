const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true }, // base amount
  discount: { type: Number, default: 0 },
  lateFees: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true }, // amount - discount + lateFees
  paidAmount: { type: Number, default: 0 },
  transactionId: { type: String },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'online', 'cheque'] },
  category: { type: String, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue', 'partially_paid'], default: 'pending' },
  dueDate: { type: Date },
  paidDate: { type: Date },
  academicYear: { type: String },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
}, { timestamps: true });

feePaymentSchema.pre('save', function(next) {
  this.totalAmount = (this.amount || 0) - (this.discount || 0) + (this.lateFees || 0);
  next();
});

feePaymentSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.amount !== undefined || update.discount !== undefined || update.lateFees !== undefined) {
        const amount = update.amount ?? this._update.amount;
        const discount = update.discount ?? this._update.discount;
        const lateFees = update.lateFees ?? this._update.lateFees;
        // This is complex because we don't have access to current document values easily in pre-findOneAndUpdate if not provided in update
        // But for our simplified logic we can try to calculate if all are provided or assume they are managed.
    }
    next();
});

feePaymentSchema.index({ schoolId: 1, studentId: 1, category: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
