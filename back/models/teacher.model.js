const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  schoolAdminId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId:     { type: String, unique: true },
  firstName:      { type: String, required: true },
  lastName:       { type: String, required: true },
  email:          { type: String, unique: true, sparse: true },
  phone:          { type: String, unique: true, sparse: true },
  qualifications: [{ type: String }],
  joiningDate:    { type: Date },
  baseSalary:     { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate employeeId in sequence: 0001, 0002, ...
teacherSchema.pre('save', async function (next) {
  if (this.employeeId) return next(); // already set, skip

  const last = await this.constructor
    .findOne({ schoolId: this.schoolId }, { employeeId: 1 })
    .sort({ employeeId: -1 })
    .lean();

  let nextNum = 1;
  if (last?.employeeId) {
    const parsed = parseInt(last.employeeId, 10);
    if (!isNaN(parsed)) nextNum = parsed + 1;
  }

  this.employeeId = String(nextNum).padStart(4, '0');
  next();
});

module.exports = mongoose.model('Teacher', teacherSchema);
