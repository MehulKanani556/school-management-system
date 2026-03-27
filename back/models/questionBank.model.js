const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },

    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },

    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    classLevel: { type: String, required: true },
    content: { type: String, required: true },
    options: [{ type: String }], 
    correctAnswer: { type: String },
    marks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    type: { type: String, },
    fileUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', questionBankSchema);
