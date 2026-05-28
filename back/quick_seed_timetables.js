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

    // Initialize schedule structures for all sections of this academic year
    const sectionSchedules = {};
    for (const section of sections) {
      sectionSchedules[section._id.toString()] = [];
    }

    const firstLectureIdx = periodTimes.findIndex(p => !p.type || !p.type.includes('Break'));
    let roomCounter = 101;
    const roomMap = {};
    for (const section of sections) {
      roomMap[section._id.toString()] = String(roomCounter++);
    }

    for (const day of days) {
      const dailyPeriods = {};
      for (const section of sections) {
        dailyPeriods[section._id.toString()] = [];
      }

      for (let idx = 0; idx < periodTimes.length; idx++) {
        const p = periodTimes[idx];

        if (p.type && p.type.includes('Break')) {
          for (const section of sections) {
            dailyPeriods[section._id.toString()].push({
              startTime: p.start,
              endTime: p.end,
              type: p.type
            });
          }
          continue;
        }

        const assignedTeacherIds = new Set();
        const scheduledSectionsThisPeriod = {};

        // 1. First Pass: Fixed assignments (First lecture is Class Teacher)
        const isFirstLecture = (idx === firstLectureIdx);
        if (isFirstLecture) {
          for (const section of sections) {
            const classTeacher = section.classTeacher;
            if (classTeacher) {
              const teacherId = classTeacher._id.toString();
              assignedTeacherIds.add(teacherId);

              const secSubjects = subjects.filter(s => s.schoolId.toString() === section.schoolId.toString());
              const subjectId = secSubjects[idx % secSubjects.length]?._id;

              dailyPeriods[section._id.toString()].push({
                startTime: p.start,
                endTime: p.end,
                type: 'Lecture',
                subject: subjectId,
                teacher: classTeacher._id,
                room: roomMap[section._id.toString()]
              });

              scheduledSectionsThisPeriod[section._id.toString()] = true;
            }
          }
        }

        // 2. Second Pass: Assign available teachers to remaining sections
        for (const section of sections) {
          if (scheduledSectionsThisPeriod[section._id.toString()]) continue;

          const availableTeachers = teachers.filter(t => !assignedTeacherIds.has(t._id.toString()));
          let chosenTeacher = null;

          if (availableTeachers.length > 0) {
            const pickIdx = (idx + sections.indexOf(section)) % availableTeachers.length;
            chosenTeacher = availableTeachers[pickIdx];
            assignedTeacherIds.add(chosenTeacher._id.toString());
          } else {
            chosenTeacher = teachers[0];
          }

          const secSubjects = subjects.filter(s => s.schoolId.toString() === section.schoolId.toString());
          const subjectId = secSubjects[idx % secSubjects.length]?._id;

          dailyPeriods[section._id.toString()].push({
            startTime: p.start,
            endTime: p.end,
            type: 'Lecture',
            subject: subjectId,
            teacher: chosenTeacher?._id,
            room: roomMap[section._id.toString()]
          });
        }
      }

      for (const section of sections) {
        sectionSchedules[section._id.toString()].push({
          day,
          periods: dailyPeriods[section._id.toString()]
        });
      }
    }

    for (const section of sections) {
      await Timetable.findOneAndUpdate(
        { classSection: section._id, academicYearId: year._id },
        { 
          schoolId: section.schoolId, 
          standardId: section.standardId, 
          classSection: section._id, 
          schedule: sectionSchedules[section._id.toString()], 
          academicYearId: year._id 
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Generated timetables for year ${year.name}`);
  }
  
  console.log('Done generating all timetables!');
  process.exit();
}
seed();
