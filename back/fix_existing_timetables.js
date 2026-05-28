const mongoose = require('mongoose');
require('dotenv').config();

const AcademicYear = require('./models/academicYear.model');
const ClassSection = require('./models/classSection.model');
const Subject = require('./models/subject.model');
const Teacher = require('./models/teacher.model');
const Timetable = require('./models/timetable.model');

async function runFix() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected to Database');

  // Step 1: Find all distinct school + academicYear combinations
  const combinations = await ClassSection.aggregate([
    {
      $group: {
        _id: {
          schoolId: '$schoolId',
          academicYearId: '$academicYearId'
        }
      }
    }
  ]);

  console.log(`Found ${combinations.length} distinct school & academic year combinations to process.`);

  for (const comb of combinations) {
    const { schoolId, academicYearId } = comb._id;
    if (!schoolId || !academicYearId) continue;

    console.log(`\nProcessing School: ${schoolId}, Academic Year: ${academicYearId}`);

    // Fetch all entities for this school + year
    const sections = await ClassSection.find({ schoolId, academicYearId }).populate('classTeacher');
    const teachers = await Teacher.find({ schoolId });
    const subjects = await Subject.find({ schoolId });
    const timetables = await Timetable.find({ schoolId, academicYearId });

    if (sections.length === 0) {
      console.log('No class sections found for this combination. Skipping.');
      continue;
    }
    if (teachers.length === 0) {
      console.log('No teachers found for this school. Skipping.');
      continue;
    }
    if (subjects.length === 0) {
      console.log('No subjects found for this school. Skipping.');
      continue;
    }

    console.log(`Found ${sections.length} sections, ${teachers.length} teachers, ${subjects.length} subjects, and ${timetables.length} timetables.`);

    // Map of sectionId -> ClassSection doc
    const sectionMap = {};
    for (const sec of sections) {
      sectionMap[sec._id.toString()] = sec;
    }

    // Process each timetable
    for (const tt of timetables) {
      const section = sectionMap[tt.classSection.toString()];
      if (!section) {
        console.warn(`Warning: Timetable ${tt._id} has no matching ClassSection. Skipping.`);
        continue;
      }

      const classTeacher = section.classTeacher;
      if (!classTeacher) {
        console.warn(`Warning: Section ${section.sectionLabel} (${section._id}) has no classTeacher. Skipping.`);
        continue;
      }
    }

    // Days to schedule
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // We will build a new schedule for each timetable to guarantee no clashes.
    // Initialize schedule structures for all timetables of this school+year
    const ttSchedules = {};
    for (const tt of timetables) {
      ttSchedules[tt._id.toString()] = [];
    }

    // Let's get the standard period times (startTime, endTime, type) from the first timetable's Monday schedule, 
    // or fallback to the quick_seed times if no timetable has periods.
    let periodTimes = [];
    const sampleTT = timetables.find(t => t.schedule && t.schedule.length > 0 && t.schedule[0].periods && t.schedule[0].periods.length > 0);
    if (sampleTT) {
      periodTimes = sampleTT.schedule[0].periods.map(p => ({
        startTime: p.startTime,
        endTime: p.endTime,
        type: p.type || 'Lecture'
      }));
    } else {
      periodTimes = [
        { startTime: '08:00', endTime: '08:45', type: 'Lecture' },
        { startTime: '08:45', endTime: '09:00', type: 'Short Break' },
        { startTime: '09:00', endTime: '09:45', type: 'Lecture' },
        { startTime: '09:45', endTime: '10:30', type: 'Lecture' },
        { startTime: '10:30', endTime: '10:45', type: 'Short Break' },
        { startTime: '10:45', endTime: '11:30', type: 'Lecture' },
        { startTime: '11:30', endTime: '12:15', type: 'Lecture' },
        { startTime: '12:15', endTime: '13:00', type: 'Long Break' },
        { startTime: '13:00', endTime: '13:45', type: 'Lecture' },
        { startTime: '13:45', endTime: '14:30', type: 'Lecture' },
        { startTime: '14:30', endTime: '15:15', type: 'Lecture' }
      ];
    }

    console.log(`Using period times structure with ${periodTimes.length} slots.`);

    // Find the index of the first 'Lecture' period of the day
    const firstLectureIdx = periodTimes.findIndex(p => p.type === 'Lecture');
    console.log(`First lecture period index is ${firstLectureIdx} (${periodTimes[firstLectureIdx]?.startTime || 'N/A'})`);

    // For each day, we schedule period by period across ALL timetables in this school+year to prevent conflicts.
    for (const day of days) {
      // Initialize daily periods list for each timetable
      const dailyPeriods = {};
      for (const tt of timetables) {
        dailyPeriods[tt._id.toString()] = [];
      }

      for (let pIdx = 0; pIdx < periodTimes.length; pIdx++) {
        const pTime = periodTimes[pIdx];

        if (pTime.type !== 'Lecture') {
          // If it is a Break, simply assign it as a break to all timetables
          for (const tt of timetables) {
            dailyPeriods[tt._id.toString()].push({
              startTime: pTime.startTime,
              endTime: pTime.endTime,
              type: pTime.type,
              room: sectionMap[tt.classSection.toString()]?.sectionLabel || '101'
            });
          }
          continue;
        }

        // For a Lecture period, we must assign teachers uniquely.
        const assignedTeacherIds = new Set();

        // 1. First Pass: Handle the fixed assignments (first lecture goes to classTeacher)
        const isFirstLecture = (pIdx === firstLectureIdx);

        // Keep track of which timetables have been scheduled for this period in this pass
        const scheduledTTsThisPeriod = {};

        for (const tt of timetables) {
          const section = sectionMap[tt.classSection.toString()];
          const classTeacher = section?.classTeacher;

          if (isFirstLecture && classTeacher) {
            const teacherId = classTeacher._id.toString();
            // Since each section has a unique classTeacher per academic year, 
            // there will be no overlap in teacherIds in this first pass.
            assignedTeacherIds.add(teacherId);

            // Assign subject: try to use the section's subjects if they exist
            const secSubjects = section.subjects && section.subjects.length > 0 ? section.subjects : subjects.map(s => s._id);
            const subjectId = secSubjects[pIdx % secSubjects.length];

            dailyPeriods[tt._id.toString()].push({
              startTime: pTime.startTime,
              endTime: pTime.endTime,
              type: 'Lecture',
              subject: subjectId,
              teacher: classTeacher._id,
              room: section.sectionLabel || '101'
            });

            scheduledTTsThisPeriod[tt._id.toString()] = true;
          }
        }

        // 2. Second Pass: Assign available teachers to the remaining timetables
        for (const tt of timetables) {
          if (scheduledTTsThisPeriod[tt._id.toString()]) continue; // Already scheduled in first pass

          const section = sectionMap[tt.classSection.toString()];
          if (!section) continue;

          // Find an available teacher who is not currently busy in this period
          const availableTeachers = teachers.filter(t => !assignedTeacherIds.has(t._id.toString()));

          let chosenTeacher = null;
          if (availableTeachers.length > 0) {
            // Pick a teacher. Let's do a deterministic yet distributed pick to spread lessons nicely.
            // Using section index or database ID hash as a seed
            const pickIdx = (pIdx + sections.indexOf(section)) % availableTeachers.length;
            chosenTeacher = availableTeachers[pickIdx];
            assignedTeacherIds.add(chosenTeacher._id.toString());
          } else {
            // Fallback (should not happen if teachers count >= sections count, but safe fallback)
            console.warn(`Warning: No teacher available for section ${section.sectionLabel} in period ${pIdx} on ${day}.`);
            chosenTeacher = teachers[0]; // fallback
          }

          // Assign subject
          const secSubjects = section.subjects && section.subjects.length > 0 ? section.subjects : subjects.map(s => s._id);
          const subjectId = secSubjects[pIdx % secSubjects.length];

          dailyPeriods[tt._id.toString()].push({
            startTime: pTime.startTime,
            endTime: pTime.endTime,
            type: 'Lecture',
            subject: subjectId,
            teacher: chosenTeacher?._id,
            room: section.sectionLabel || '101'
          });
        }
      }

      // Add the day's periods to each timetable's scheduled days list
      for (const tt of timetables) {
        ttSchedules[tt._id.toString()].push({
          day,
          periods: dailyPeriods[tt._id.toString()]
        });
      }
    }

    // Now save all updated timetables to the database
    console.log('Saving updated timetables to database...');
    let saveCount = 0;
    for (const tt of timetables) {
      tt.schedule = ttSchedules[tt._id.toString()];
      await tt.save();
      saveCount++;
    }
    console.log(`Successfully updated ${saveCount} timetables for this combination.`);
  }

  console.log('\nDatabase fix completed successfully!');
  process.exit();
}

runFix().catch(err => {
  console.error('Fatal error during fix:', err);
  process.exit(1);
});
