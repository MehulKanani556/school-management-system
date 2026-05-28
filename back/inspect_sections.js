const mongoose = require('mongoose');
require('dotenv').config();
const ClassSection = require('./models/classSection.model');

async function checkSections() {
  await mongoose.connect(process.env.MONGODB_PATH);
  const sections = await ClassSection.find().limit(5);
  console.log('Sample sections data:');
  for (const s of sections) {
    console.log({
      _id: s._id,
      academicYearId: s.academicYearId,
      sectionLabel: s.sectionLabel,
      classTeacher: s.classTeacher,
      subjectsCount: s.subjects?.length,
      subjectAssignmentsCount: s.subjectAssignments?.length
    });
  }
  process.exit();
}
checkSections();
