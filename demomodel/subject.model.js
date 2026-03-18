const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    name: { type: String, required: true },
    creditWeight: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
