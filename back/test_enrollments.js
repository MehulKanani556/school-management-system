const mongoose = require('mongoose');
require('dotenv').config();

const StudentEnrollment = require('./models/studentEnrollment.model');
const Student = require('./models/student.model');
const AcademicYear = require('./models/academicYear.model');

async function testEnrollments() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB\n');

    const academicYears = await AcademicYear.find().sort({ startDate: 1 });
    console.log('Academic Years:');
    academicYears.forEach(ay => console.log(`  - ${ay.name} (${ay._id})`));
    console.log('');

    // Get a sample student
    const student = await Student.findOne().populate('standard classSection');
    if (!student) {
      console.log('No students found!');
      return;
    }

    console.log(`Sample Student: ${student.firstName} ${student.lastName}`);
    console.log(`Current Grade: ${student.standard?.level}, Section: ${student.classSection?.sectionLabel}`);
    console.log('');

    // Get all enrollments for this student
    const enrollments = await StudentEnrollment.find({ studentId: student._id })
      .populate('academicYearId', 'name')
      .populate('standardId', 'level')
      .populate('classSectionId', 'sectionLabel')
      .sort({ 'academicYearId.startDate': 1 });

    console.log(`Enrollments for ${student.firstName}:`);
    enrollments.forEach(e => {
      console.log(`  ${e.academicYearId.name}: Grade ${e.standardId.level}-${e.classSectionId.sectionLabel} (Roll: ${e.rollNumber})`);
    });
    console.log('');

    // Count enrollments per year
    for (const ay of academicYears) {
      const count = await StudentEnrollment.countDocuments({ academicYearId: ay._id });
      console.log(`${ay.name}: ${count} enrollments`);
      
      // Count by grade
      for (let grade = 1; grade <= 12; grade++) {
        const gradeCount = await StudentEnrollment.countDocuments({
          academicYearId: ay._id,
          'standardId': await mongoose.model('Standard').findOne({ level: grade }).then(s => s?._id)
        });
        if (gradeCount > 0) {
          console.log(`  Grade ${grade}: ${gradeCount} students`);
        }
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testEnrollments();
