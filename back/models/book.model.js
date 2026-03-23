const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    totalCopies: { type: Number, required: true, min: 0 },
    availableCopies: { type: Number, required: true, min: 0 },
    publisher: { type: String, trim: true },
    publicationYear: { type: Number, min: 0 },
    location: { type: String, trim: true },
  },
  { timestamps: true }
);

bookSchema.index({ schoolId: 1, isbn: 1 }, { unique: true });
bookSchema.index({ title: 'text', author: 'text', isbn: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
