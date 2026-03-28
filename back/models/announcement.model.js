const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    targetRole: { 
        type: String, 
        enum: ['Student', 'Teacher', 'Parent', 'Accountant', 'Librarian', 'Transport_Manager', 'All'], 
        default: 'All' 
    },
    targetRoles: [{ 
      type: String, 
      enum: ['Student', 'Teacher', 'Parent', 'Accountant', 'Librarian', 'Transport_Manager', 'All'], 
      default: ['All'] 
    }],
    targetClassSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
    isPublished: { type: Boolean, default: true },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
