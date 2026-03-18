const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }, // null for Super_Admin ops
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    operation: { type: String, enum: ['create', 'update', 'delete'], required: true },
    recordType: { type: String, required: true }, // 'Student', 'Teacher', 'FeePayment', 'Exam', 'User'
    recordId: { type: mongoose.Schema.Types.ObjectId, required: true },
    changedFields: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// TTL index: expire after 2 years (63072000 seconds)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });
auditLogSchema.index({ tenantId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
