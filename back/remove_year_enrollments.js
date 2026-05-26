const mongoose = require('mongoose');
require('dotenv').config();

const StudentEnrollment = require('./models/studentEnrollment.model');
const AcademicYear = require('./models/academicYear.model');
const PromotionHistory = require('./models/promotionHistory.model');
const Attendance = require('./models/attendance.model');
const FeePayment = require('./models/feePayment.model');
const Mark = require('./models/mark.model');
const Assignment = require('./models/assignment.model');
const Submission = require('./models/submission.model');

async function removeYearEnrollments() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB\n');

    // Find the 2027-2028 academic year
    const academicYear = await AcademicYear.findOne({ 
      name: '2027-2028' 
    });

    if (!academicYear) {
      console.log('Academic year 2027-2028 not found!');
      return;
    }

    console.log(`Found academic year: ${academicYear.name} (${academicYear._id})\n`);

    const academicYearId = academicYear._id;

    // Count records before deletion
    const enrollmentCount = await StudentEnrollment.countDocuments({ academicYearId });
    const promotionCount = await PromotionHistory.countDocuments({ toAcademicYear: academicYearId });
    const attendanceCount = await Attendance.countDocuments({ academicYearId });
    const feeCount = await FeePayment.countDocuments({ academicYearId });
    const markCount = await Mark.countDocuments({ academicYearId });
    const assignmentCount = await Assignment.countDocuments({ academicYearId });
    const submissionCount = await Submission.countDocuments({ academicYearId });

    console.log('Records to be deleted:');
    console.log(`  - Student Enrollments: ${enrollmentCount}`);
    console.log(`  - Promotion History: ${promotionCount}`);
    console.log(`  - Attendance Records: ${attendanceCount}`);
    console.log(`  - Fee Payments: ${feeCount}`);
    console.log(`  - Marks: ${markCount}`);
    console.log(`  - Assignments: ${assignmentCount}`);
    console.log(`  - Submissions: ${submissionCount}`);
    console.log('');

    // Confirm deletion
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Do you want to proceed with deletion? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('Deletion cancelled.');
        readline.close();
        await mongoose.disconnect();
        return;
      }

      console.log('\nDeleting records...\n');

      // Delete all related records
      const enrollmentResult = await StudentEnrollment.deleteMany({ academicYearId });
      console.log(`✅ Deleted ${enrollmentResult.deletedCount} student enrollments`);

      const promotionResult = await PromotionHistory.deleteMany({ toAcademicYear: academicYearId });
      console.log(`✅ Deleted ${promotionResult.deletedCount} promotion history records`);

      const attendanceResult = await Attendance.deleteMany({ academicYearId });
      console.log(`✅ Deleted ${attendanceResult.deletedCount} attendance records`);

      const feeResult = await FeePayment.deleteMany({ academicYearId });
      console.log(`✅ Deleted ${feeResult.deletedCount} fee payment records`);

      const markResult = await Mark.deleteMany({ academicYearId });
      console.log(`✅ Deleted ${markResult.deletedCount} mark records`);

      const assignmentResult = await Assignment.deleteMany({ academicYearId });
      console.log(`✅ Deleted ${assignmentResult.deletedCount} assignment records`);

      const submissionResult = await Submission.deleteMany({ academicYearId });
      console.log(`✅ Deleted ${submissionResult.deletedCount} submission records`);

      console.log('\n✅ All records for academic year 2027-2028 have been removed!');

      readline.close();
      await mongoose.disconnect();
    });

  } catch (err) {
    console.error('Error:', err);
    await mongoose.disconnect();
  }
}

removeYearEnrollments();
