const mongoose = require('mongoose');
require('dotenv').config();

const ClassSection = require('./models/classSection.model');
const Teacher = require('./models/teacher.model');
const Subject = require('./models/subject.model');
const Timetable = require('./models/timetable.model');

async function verify() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected');

  const timetables = await Timetable.find().populate('classSection');
  let checked = 0;
  let correct = 0;

  for (const tt of timetables) {
    if (!tt.classSection) continue;
    
    // Fetch the populated class section to get the classTeacher
    const section = await ClassSection.findById(tt.classSection._id).populate('classTeacher');
    if (!section || !section.classTeacher) continue;

    const classTeacherId = section.classTeacher._id.toString();

    for (const daySched of tt.schedule) {
      // Find index of first period of type 'Lecture'
      const firstLecture = daySched.periods.find(p => p.type === 'Lecture');
      if (firstLecture) {
        checked++;
        if (firstLecture.teacher && firstLecture.teacher.toString() === classTeacherId) {
          correct++;
        } else {
          console.log(`Failed: TT ${tt._id} Section ${section.sectionLabel} on ${daySched.day} first lecture is not class teacher. Expected: ${classTeacherId}, Found: ${firstLecture.teacher}`);
        }
      }
    }
  }

  console.log(`First lectures verified: ${correct} / ${checked} are correct.`);
  process.exit();
}

verify();
