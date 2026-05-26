const mongoose = require('mongoose');
require('dotenv').config();
const ClassSection = require('./models/classSection.model');
const Subject = require('./models/subject.model');
const Teacher = require('./models/teacher.model');

async function fix() {
  await mongoose.connect(process.env.MONGODB_PATH);
  
  const sections = await ClassSection.find();
  if (sections.length === 0) return console.log('No sections');
  
  const subjects = await Subject.find({ schoolId: sections[0].schoolId });
  const teachers = await Teacher.find({ schoolId: sections[0].schoolId });
  
  for (const section of sections) {
    const assignments = subjects.map(sub => {
      // Just assign all teachers to each subject for the sake of the dropdown UI
      return {
        subject: sub._id,
        teachers: teachers.map(t => t._id)
      };
    });
    
    section.subjectAssignments = assignments;
    await section.save();
  }
  
  console.log('Fixed subject assignments for all sections!');
  process.exit();
}
fix();
