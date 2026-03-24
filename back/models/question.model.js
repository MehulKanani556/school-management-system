const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of the correct option (0-3 usually)
  points: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
