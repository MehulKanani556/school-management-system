const mongoose = require('mongoose');

const issueRecordSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    fine: { type: Number, default: 0 },
    status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IssueRecord', issueRecordSchema);
