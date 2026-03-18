const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    deliveryStatus: {
      inApp: { type: String, enum: ['pending', 'delivered', 'failed'], default: 'pending' },
      email: { type: String, enum: ['pending', 'delivered', 'failed', 'skipped'], default: 'pending' },
      sms: { type: String, enum: ['pending', 'delivered', 'failed', 'skipped'], default: 'pending' },
    },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

notificationSchema.index({ tenantId: 1, recipientId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
