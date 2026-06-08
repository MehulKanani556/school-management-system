const mongoose = require('mongoose');
require('dotenv').config();

// Register all schemas/models
const Standard = require('./models/standard.model');
const ClassSection = require('./models/classSection.model');
const Subject = require('./models/subject.model');
const Teacher = require('./models/teacher.model');
const Timetable = require('./models/timetable.model');
const AcademicYear = require('./models/academicYear.model');
const Student = require('./models/student.model');
const StudentEnrollment = require('./models/studentEnrollment.model');

async function run() {
    const dbPath = process.env.MONGODB_PATH || process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/school';
    await mongoose.connect(dbPath);
    console.log("Connected.");

    const year = await AcademicYear.findOne({ name: '2026-2027' });
    console.log("2026-2027 Year ID:", year._id);

    const student = await Student.findOne({ admissionNumber: 'ADM-2026-VIDY-0003' });
    console.log("Student Kabir Verma ID:", student._id);

    const enrollment = await StudentEnrollment.findOne({ studentId: student._id, academicYearId: year._id });
    console.log("Enrollment for 2026-2027:", enrollment ? {
        _id: enrollment._id,
        standardId: enrollment.standardId,
        classSectionId: enrollment.classSectionId
    } : 'none');

    const classSectionId = enrollment?.classSectionId || student.classSection;

    const timetable = await Timetable.findOne({ classSection: classSectionId, academicYearId: year._id })
        .populate('schedule.periods.subject')
        .populate('schedule.periods.teacher');

    if (!timetable) {
        console.log("No timetable found for Kabir Verma in 2026-2027");
    } else {
        console.log(`Timetable found for 2026-2027 classSection ${classSectionId}:`);
        const mon = timetable.schedule.find(s => s.day === 'Monday');
        if (mon) {
            console.log("Monday Periods:");
            mon.periods.forEach((p, i) => {
                console.log(`- Period ${i+1}: Type=${p.type}, startTime=${p.startTime}, endTime=${p.endTime}, subject=${p.subject?.name || 'none'}, teacher=${p.teacher?.firstName || 'none'}`);
            });
        } else {
            console.log("No Monday schedule found");
        }
    }

    mongoose.connection.close();
}

run().catch(err => {
    console.error(err);
    mongoose.connection.close();
});
