const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true },
    paymentMethod: { type: String, enum: ['cash', 'online', 'cheque'], required: true },
    transactionRef: { type: String },
    gatewayTransactionId: { type: String },
    receiptNumber: { type: String, required: true },
    status: { type: String, enum: ['paid', 'failed', 'refunded'], default: 'paid' },
    refundAmount: { type: Number, default: 0 },
    refundReason: { type: String },
    refundDate: { type: Date },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

feePaymentSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
