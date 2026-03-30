const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  standardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Standard', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  dueDate: { type: Date },
  feeItems: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent duplicate structures for same standard/year
feeStructureSchema.index({ schoolId: 1, standardId: 1, academicYearId: 1 }, { unique: true });

// Auto-calculate totalAmount before saving
feeStructureSchema.pre('save', function(next) {
  this.totalAmount = this.feeItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  next();
});

feeStructureSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.feeItems) {
    update.totalAmount = update.feeItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
