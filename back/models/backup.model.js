const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service: {
        type: String,
        default: 'Cloud_MongoDB_S3_Relay',
    },
    fileSizeMB: Number,
    downloadUrl: String,
    status: {
        type: String,
        enum: ['Initializing', 'Exporting', 'Compressing', 'Encrypting', 'Relayed', 'Failed'],
        default: 'Initializing',
    },
    type: {
        type: String,
        enum: ['Full', 'Incremental', 'System_Config'],
        default: 'Full',
    },
    checksum: String, // SHA-256 integrity token
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
});

module.exports = mongoose.model('Backup', backupSchema);
