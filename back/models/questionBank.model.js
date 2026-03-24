const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolDomain', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    classLevel: { type: String, required: true },
    content: { type: String, required: true },
    options: [{ type: String }], 
    correctAnswer: { type: String },
    marks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    type: { type: String, enum: ['MCQ', 'ShortAnswer', 'LongAnswer', 'TrueFalse'], default: 'ShortAnswer' }
}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', questionBankSchema);
