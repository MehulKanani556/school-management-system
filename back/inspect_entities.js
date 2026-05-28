const mongoose = require('mongoose');
require('dotenv').config();
const AcademicYear = require('./models/academicYear.model');
const ClassSection = require('./models/classSection.model');
const Subject = require('./models/subject.model');
const Teacher = require('./models/teacher.model');
const Timetable = require('./models/timetable.model');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected');

  const years = await AcademicYear.find();
  console.log('Years count:', years.length);
  for (const y of years) {
    const tts = await Timetable.find({ academicYearId: y._id });
    const sections = await ClassSection.find({ academicYearId: y._id });
    console.log(`Year ${y.name} (${y._id}): ${tts.length} timetables, ${sections.length} class sections`);
  }

  const teachers = await Teacher.find();
  console.log('Teachers count:', teachers.length);

  const subjects = await Subject.find();
  console.log('Subjects count:', subjects.length);

  process.exit();
}
inspect();
