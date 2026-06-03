const mongoose = require('mongoose');
require('dotenv').config();
const AcademicYear = require('./models/academicYear.model');
const ClassSection = require('./models/classSection.model');
const Teacher = require('./models/teacher.model');
const Student = require('./models/student.model');
const User = require('./models/user.model');
const FeePayment = require('./models/feePayment.model');
const Standard = require('./models/standard.model');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected');

  // Find the teacher Harsh Mehta
  const user = await User.findOne({ email: 'harsh.mehta.48.teacher@vidyamandir.edu.in' });
  const teacher = await Teacher.findOne({ userId: user._id });

  // Academic year 2026-2027
  const year26 = await AcademicYear.findOne({ name: '2026-2027' });
  console.log('Academic Year ID:', year26._id);

  // We mimic the backend controller getStudentFeeStatus
  const assignedClasses = await ClassSection.find({
      academicYearId: year26._id,
      $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
  });
  const classIds = assignedClasses.map(c => c._id);
  console.log('Assigned classes count:', classIds.length);

  const students = await Student.find({ classSection: { $in: classIds }, deletedAt: null })
      .populate('classSection', 'sectionLabel')
      .populate('standard', 'level');
  console.log('Enrolled students count:', students.length);

  // Let's print details of first 3 students
  students.slice(0, 3).forEach(s => {
    console.log(`Student: id=${s._id}, name=${s.firstName} ${s.lastName}, admissionNumber=${s.admissionNumber}`);
  });

  const feeStatus = await Promise.all(students.map(async (s) => {
      const fees = await FeePayment.find({ studentId: s._id });
      const pendingAmount = fees.reduce((acc, f) => acc + (f.status !== 'paid' ? (f.totalAmount - f.paidAmount) : 0), 0);
      return {
          studentId: s._id,
          name: `${s.firstName} ${s.lastName}`,
          photo: s.photo,
          admissionNumber: s.admissionNumber,
          class: `Grade ${s.standard?.level || 'N/A'}-${s.classSection?.sectionLabel || '?'}`,
          totalPending: pendingAmount,
          status: pendingAmount > 0 ? 'Pending' : 'Cleared'
      };
  }));

  console.log('Fee status records generated:', feeStatus.length);
  if (feeStatus.length > 0) {
    console.log('Sample feeStatus record:', feeStatus[0]);
  }

  process.exit();
}

inspect();
