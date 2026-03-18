const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    totalCopies: { type: Number, required: true, min: 0 },
    availableCopies: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

bookSchema.index({ tenantId: 1, isbn: 1 }, { unique: true });
bookSchema.index({ title: 'text', author: 'text', isbn: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
