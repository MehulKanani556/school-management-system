require('dotenv').config();
const mongoose = require('mongoose');
const StudentEnrollment = require('./models/studentEnrollment.model');
const ClassSection = require('./models/classSection.model');
const Standard = require('./models/standard.model');
const AcademicYear = require('./models/academicYear.model');
const Student = require('./models/student.model');

async function removeSectionEnrollments() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('✅ Connected to MongoDB');

    // Find the academic year 2027-28
    const academicYear = await AcademicYear.findOne({ name: '2027-2028' });
    if (!academicYear) {
      console.log('❌ Academic year 2027-2028 not found');
      process.exit(1);
    }
    console.log(`📅 Found academic year: ${academicYear.name} (${academicYear._id})`);

    // Find Grade 12 standard
    const standard = await Standard.findOne({ level: 12 });
    if (!standard) {
      console.log('❌ Grade 12 standard not found');
      process.exit(1);
    }
    console.log(`📚 Found standard: Grade ${standard.level} (${standard._id})`);

    // Find Section D for Grade 12
    const sectionD = await ClassSection.findOne({ 
      standardId: standard._id, 
      sectionLabel: 'D' 
    });
    if (!sectionD) {
      console.log('❌ Section D not found for Grade 12');
      process.exit(1);
    }
    console.log(`🏫 Found section: Grade 12 - Section D (${sectionD._id})`);

    // Find all enrollments in Grade 12 Section D for 2027-28
    const enrollments = await StudentEnrollment.find({
      academicYearId: academicYear._id,
      standardId: standard._id,
      classSectionId: sectionD._id
    }).populate('studentId', 'firstName lastName admissionNumber');

    console.log(`\n👥 Found ${enrollments.length} students enrolled in Grade 12 Section D for 2027-2028:`);
    enrollments.forEach((e, idx) => {
      console.log(`   ${idx + 1}. ${e.studentId?.firstName} ${e.studentId?.lastName} (${e.studentId?.admissionNumber})`);
    });

    if (enrollments.length === 0) {
      console.log('\n✅ No students to remove. Section D is already empty for 2027-2028.');
      process.exit(0);
    }

    // Ask for confirmation
    console.log('\n⚠️  This will DELETE these enrollment records from Grade 12 Section D for 2027-2028.');
    console.log('⚠️  Students will no longer be enrolled in any section for this year unless reassigned.');
    console.log('\nProceed with deletion? (yes/no)');

    // For automated execution, set to 'yes'
    const proceed = 'yes';
    
    if (proceed.toLowerCase() === 'yes') {
      // Delete the enrollments
      const result = await StudentEnrollment.deleteMany({
        academicYearId: academicYear._id,
        standardId: standard._id,
        classSectionId: sectionD._id
      });

      console.log(`\n✅ Successfully removed ${result.deletedCount} enrollment records from Grade 12 Section D for 2027-2028`);
      console.log('✅ Section D will now show 0 students for academic year 2027-2028');
      console.log('\n📝 Note: The section itself still exists and can be used in other academic years.');
    } else {
      console.log('\n❌ Operation cancelled');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeSectionEnrollments();
