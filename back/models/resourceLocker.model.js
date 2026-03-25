const mongoose = require('mongoose');

const resourceLockerSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },

    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },

    classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    title: { type: String, required: true },
    description: { type: String },
    resourceType: { type: String, enum: ['PDF', 'Video', 'Document', 'Image', 'Other'], default: 'Document' },
    fileUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ResourceLocker', resourceLockerSchema);
