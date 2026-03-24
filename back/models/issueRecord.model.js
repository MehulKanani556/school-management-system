const mongoose = require('mongoose');

const issueRecordSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, refPath: 'borrowerModel', required: true },
    borrowerModel: { type: String, required: true, enum: ['User', 'Student'], default: 'User' },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    fine: { type: Number, default: 0 },
    fineStatus: { type: String, enum: ['unpaid', 'paid', 'waived'], default: 'unpaid' },
    renewalCount: { type: Number, default: 0 },
    status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IssueRecord', issueRecordSchema);
