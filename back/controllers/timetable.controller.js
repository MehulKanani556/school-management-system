const Timetable = require('../models/timetable.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const ClassSection = require('../models/classSection.model');

// 1. Get Timetable for a specific class
exports.getTimetableByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        
        // If teacher, verify they teach in this class
        if (req.user.role === 'Teacher') {
            const teacher = await Teacher.findOne({ userId: req.user._id });
            const classCheck = await ClassSection.findOne({ 
                _id: classId, 
                $or: [
                    { classTeacher: teacher?._id },
                    { 'subjectAssignments.teachers': teacher?._id }
                ]
            });
            if (!classCheck) return res.status(403).json({ message: 'Unauthorized: Sector access restricted' });
        }

        const timetable = await Timetable.findOne({ classSection: classId, academicYearId: req.academicYearId })
            .populate('schedule.periods.subject')
            .populate('schedule.periods.teacher', 'firstName lastName');
        res.json(timetable || { classSection: classId, schedule: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Admin: Create/Update Timetable
exports.upsertTimetable = async (req, res) => {
    try {
        const { classSection, schedule } = req.body;
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        const section = await ClassSection.findById(classSection);
        if (!section) return res.status(404).json({ message: 'Class section not found' });
        const standardId = section.standardId;

        // Conflict detection (Teacher overlap check)
        const allTimetables = await Timetable.find({ schoolId, academicYearId: req.academicYearId, classSection: { $ne: classSection } });
        
        for (const daySchedule of schedule) {
            const day = daySchedule.day;
            for (const period of daySchedule.periods) {
                if (period.type === 'Break' || !period.teacher) continue;
                
                const s1 = period.startTime;
                const e1 = period.endTime;

                for (const otherTT of allTimetables) {
                    const otherDay = otherTT.schedule.find(s => s.day === day);
                    if (!otherDay) continue;

                    for (const otherPeriod of otherDay.periods) {
                        if (otherPeriod.type === 'Break' || !otherPeriod.teacher) continue;
                        if (String(otherPeriod.teacher) === String(period.teacher)) {
                            const s2 = otherPeriod.startTime;
                            const e2 = otherPeriod.endTime;
                            
                            // Check overlap: s1 < e2 && s2 < e1
                            if (s1 < e2 && s2 < e1) {
                                return res.status(400).json({ 
                                    message: `Conflict detected: Teacher is already busy on ${day} from ${s2} to ${e2} in another room.`
                                });
                            }
                        }
                    }
                }
            }
        }

        let timetable = await Timetable.findOne({ classSection, academicYearId: req.academicYearId });

        if (timetable) {
            timetable.schedule = schedule;
            timetable.standardId = standardId;
            await timetable.save();
        } else {
            timetable = new Timetable({ schoolId, standardId, classSection, schedule, academicYearId: req.academicYearId });
            await timetable.save();
        }

        const populated = await Timetable.findById(timetable._id)
            .populate('schedule.periods.subject')
            .populate('schedule.periods.teacher', 'firstName lastName');

        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Student: Get my class timetable
exports.getStudentTimetable = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) {
            console.log(`[DEBUG] Student node missing for user: ${req.user._id}`);
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log(`[DEBUG] Fetching timetable for student section: ${student.classSection}`);
        const timetable = await Timetable.findOne({ classSection: student.classSection, academicYearId: req.academicYearId })
            .populate('schedule.periods.subject')
            .populate('schedule.periods.teacher', 'firstName lastName');
        
        if (timetable) console.log(`[DEBUG] Timetable found with ${timetable.schedule?.length || 0} active days`);
        else console.log(`[DEBUG] No timetable record found for section ${student.classSection}`);
        res.json(timetable || { schedule: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Admin: Get all timetables (for overview)
exports.getAllTimetables = async (req, res) => {
    try {
        const schoolId = req.user.schoolId._id || req.user.schoolId;
        const timetables = await Timetable.find({ schoolId, academicYearId: req.academicYearId })
            .populate({ path: 'classSection', populate: { path: 'standardId' } })
            .populate('schedule.periods.subject')
            .populate('schedule.periods.teacher', 'firstName lastName');
        res.json(timetables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. Admin: Delete a specific class timetable
exports.deleteTimetable = async (req, res) => {
    try {
        const { timetableId } = req.params;
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        const timetable = await Timetable.findOneAndDelete({ _id: timetableId, schoolId });
        if (!timetable) return res.status(404).json({ message: 'Timetable node not found or unauthorized' });

        res.json({ message: 'Timetable purged successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
