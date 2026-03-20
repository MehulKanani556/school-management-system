const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/user.model');
const Teacher = require('./models/teacher.model');
const Standard = require('./models/standard.model');
const Subject = require('./models/subject.model');
const ClassSection = require('./models/classSection.model');

async function seedClasses() {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to DB');

        const admin = await User.findOne({ role: 'School_Admin' });
        if (!admin) {
            console.error('No School_Admin found.');
            process.exit(1);
        }

        const schoolId = admin.schoolId;

        const levels = [1, 2, 3, 4, 5];
        const sectionLabels = ['A', 'B'];

        for (const level of levels) {
            console.log(`Processing Standard ${level}...`);

            const standard = await Standard.findOne({ schoolId, level });
            if (!standard) {
                console.log(`Standard ${level} not found. Skipping.`);
                continue;
            }

            // Get subjects only defined for this standard
            const standardSubjects = standard.subjects.map(sId => sId.toString());
            const subjects = await Subject.find({ _id: { $in: standardSubjects } });
            
            // Find teachers for this school first.
            const allTeachers = await Teacher.find({ schoolId });
            const levelTeachers = allTeachers.filter(t => t.email && (new RegExp(`${level}@gmail.com$`).test(t.email) || new RegExp(`teacher${level}`).test(t.email)));

            if (levelTeachers.length === 0) {
                console.error(`No teachers found for Standard ${level}. Skipping.`);
                continue;
            }

            for (let i = 0; i < sectionLabels.length; i++) {
                const label = sectionLabels[i];
                // Rotate through level teachers for class teacher
                const classTeacher = levelTeachers[i % levelTeachers.length];

                // Build subject assignments
                // Map each subject to two teachers from the levelTeachers pool if available
                const subjectAssignments = subjects.map((sub, sIdx) => {
                    const teachers = [];
                    // Always pick at least one
                    teachers.push(levelTeachers[sIdx % levelTeachers.length]._id);
                    // Pick a second different teacher if available
                    if (levelTeachers.length > 1) {
                        teachers.push(levelTeachers[(sIdx + 1) % levelTeachers.length]._id);
                    }
                    
                    return {
                        subject: sub._id,
                        teachers: teachers
                    };
                });

                // Check if class section already exists
                let section = await ClassSection.findOne({ schoolId, standardId: standard._id, sectionLabel: label });
                if (section) {
                    // Update existing
                    section.classTeacher = classTeacher._id;
                    section.subjectAssignments = subjectAssignments;
                    section.subjects = subjects.map(s => s._id);
                    await section.save();
                    console.log(`Updated ClassSection: Standard ${level} - ${label}`);
                } else {
                    // Create new
                    await ClassSection.create({
                        schoolId,
                        standardId: standard._id,
                        sectionLabel: label,
                        classTeacher: classTeacher._id,
                        subjectAssignments: subjectAssignments,
                        subjects: subjects.map(s => s._id)
                    });
                    console.log(`Created ClassSection: Standard ${level} - ${label}`);
                }
            }
        }

        console.log('Classroom seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding classes:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedClasses();
