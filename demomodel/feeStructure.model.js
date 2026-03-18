const mongoose = require('mongoose');

const feeCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', default: null },
    categories: [feeCategorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
