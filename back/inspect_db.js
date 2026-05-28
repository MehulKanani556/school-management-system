const mongoose = require('mongoose');
require('dotenv').config();
const Timetable = require('./models/timetable.model');
const ClassSection = require('./models/classSection.model');
const Teacher = require('./models/teacher.model');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected to DB');

  const timetables = await Timetable.find().populate('classSection');
  console.log('Total timetables:', timetables.length);

  if (timetables.length > 0) {
    console.log('Sample Timetable keys and schedule count:');
    const sample = timetables[0];
    console.log({
      _id: sample._id,
      classSection: sample.classSection ? sample.classSection.sectionLabel : 'none',
      classSectionId: sample.classSection ? sample.classSection._id : 'none',
      scheduleDays: sample.schedule.map(s => s.day),
      firstDayPeriods: sample.schedule[0] ? sample.schedule[0].periods.length : 0
    });

    // Check for conflicts in current database within each academic year:
    // Conflict definition: same teacher, same day, same time slot, same academic year
    let conflicts = 0;
    const teacherSchedule = {}; // academicYearId -> day -> timeSlot -> teacherId -> classSection
    
    for (const tt of timetables) {
      const yearId = tt.academicYearId ? tt.academicYearId.toString() : 'unknown';
      if (!teacherSchedule[yearId]) teacherSchedule[yearId] = {};

      for (const daySched of tt.schedule) {
        const day = daySched.day;
        if (!teacherSchedule[yearId][day]) teacherSchedule[yearId][day] = {};
        
        for (const period of daySched.periods) {
          if (period.type && period.type.includes('Break')) continue;
          if (!period.teacher) continue;
          
          const timeSlot = `${period.startTime}-${period.endTime}`;
          if (!teacherSchedule[yearId][day][timeSlot]) teacherSchedule[yearId][day][timeSlot] = {};
          
          const teacherId = period.teacher.toString();
          if (teacherSchedule[yearId][day][timeSlot][teacherId]) {
            conflicts++;
            if (conflicts <= 5) {
              console.log(`Conflict ${conflicts}: Teacher ${teacherId} is in both section ${teacherSchedule[yearId][day][timeSlot][teacherId]} and section ${tt.classSection?._id} at ${day} ${timeSlot} in academic year ${yearId}`);
            }
          } else {
            teacherSchedule[yearId][day][timeSlot][teacherId] = tt.classSection?._id;
          }
        }
      }
    }
    console.log('Total current conflicts (grouped by academic year):', conflicts);
  }

  process.exit();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
