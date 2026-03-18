const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    targetRoles: [{ type: String }],
    targetClassSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
