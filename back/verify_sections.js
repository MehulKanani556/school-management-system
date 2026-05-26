require('dotenv').config();
const mongoose = require('mongoose');
const ClassSection = require('./models/classSection.model');
const AcademicYear = require('./models/academicYear.model');
const Standard = require('./models/standard.model');
const Teacher = require('./models/teacher.model');

async function verifySections() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('✅ Connected to MongoDB\n');

    const academicYear2027 = await AcademicYear.findOne({ name: '2027-2028' });
    const grade12 = await Standard.findOne({ level: 12 });

    console.log('📅 Academic Year 2027-2028 sections for Grade 12:\n');
    
    const sections = await ClassSection.find({
      academicYearId: academicYear2027._id,
      standardId: grade12._id
    })
      .populate('academicYearId', 'name')
      .populate('standardId', 'level')
      .populate('classTeacher', 'firstName lastName')
      .lean();

    sections.forEach(s => {
      console.log(`   ✓ Grade ${s.standardId.level} - Section ${s.sectionLabel}`);
      console.log(`     Teacher: ${s.classTeacher.firstName} ${s.classTeacher.lastName}`);
      console.log(`     Academic Year: ${s.academicYearId.name}`);
      console.log('');
    });

    console.log(`Total sections: ${sections.length}`);
    console.log('\n✅ Verification complete');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifySections();
