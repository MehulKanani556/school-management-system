const mongoose = require('mongoose');
require('dotenv').config();
const Timetable = require('./models/timetable.model');
const ClassSection = require('./models/classSection.model');
const AcademicYear = require('./models/academicYear.model');
const Subject = require('./models/subject.model');
const Teacher = require('./models/teacher.model');

async function seed() {
  await mongoose.connect(process.env.MONGODB_PATH);
  
  const allYears = await AcademicYear.find();
  if (allYears.length === 0) return console.log('No academic years');

  for (const year of allYears) {
    const sections = await ClassSection.find({ academicYearId: year._id }).populate('classTeacher');
    if (sections.length === 0) continue;
    
    const subjects = await Subject.find({ schoolId: sections[0]?.schoolId });
    const teachers = await Teacher.find({ schoolId: sections[0]?.schoolId });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periodTimes = [
      { start: '08:00', end: '08:45' }, 
      { start: '08:45', end: '09:00', type: 'Short Break' },
      { start: '09:00', end: '09:45' }, 
      { start: '09:45', end: '10:30' },
      { start: '10:30', end: '10:45', type: 'Short Break' }, 
      { start: '10:45', end: '11:30' },
      { start: '11:30', end: '12:15' }, 
      { start: '12:15', end: '13:00', type: 'Long Break' },
      { start: '13:00', end: '13:45' }, 
      { start: '13:45', end: '14:30' }, 
      { start: '14:30', end: '15:15' }
    ];

    // Track teacher availability: teacherBusy[day][periodIndex] = Set of teacher IDs currently busy
    const teacherBusy = {};
    for (const day of days) {
      teacherBusy[day] = {};
      for (let i = 0; i < periodTimes.length; i++) {
        teacherBusy[day][i] = new Set();
      }
    }

    let roomCounter = 101;
    for (const section of sections) {
      const classTeacher = section.classTeacher;
      const sectionSubjects = subjects; 
      const sectionRoom = String(roomCounter++);

      const schedule = days.map((day) => {
        let isFirstLecture = true;

        const periods = periodTimes.map((p, idx) => {
          if (p.type && p.type.includes('Break')) {
            return { startTime: p.start, endTime: p.end, type: p.type };
          }

          let assignedTeacher = null;
          let assignedSubject = null;

          if (isFirstLecture) {
            assignedTeacher = classTeacher;
            assignedSubject = sectionSubjects[idx % sectionSubjects.length];
            isFirstLecture = false;
          } else {
            const busySet = teacherBusy[day][idx];
            const availableTeachers = teachers.filter(t => !busySet.has(t._id.toString()));
            
            if (availableTeachers.length > 0) {
              assignedTeacher = availableTeachers[idx % availableTeachers.length];
              assignedSubject = sectionSubjects[idx % sectionSubjects.length];
            } else {
              assignedTeacher = teachers[0];
              assignedSubject = sectionSubjects[0];
            }
          }

          if (assignedTeacher) {
            teacherBusy[day][idx].add(assignedTeacher._id.toString());
          }

          return {
            startTime: p.start, 
            endTime: p.end, 
            type: 'Lecture',
            subject: assignedSubject?._id, 
            teacher: assignedTeacher?._id, 
            room: sectionRoom
          };
        });

        return { day, periods };
      });

      await Timetable.findOneAndUpdate(
        { classSection: section._id, academicYearId: year._id },
        { schoolId: section.schoolId, standardId: section.standardId, classSection: section._id, schedule, academicYearId: year._id },
        { upsert: true, new: true }
      );
    }
    console.log(`Generated timetables for year ${year.name}`);
  }
  
  console.log('Done generating all timetables!');
  process.exit();
}
seed();
