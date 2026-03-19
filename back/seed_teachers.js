const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/user.model');
const Teacher = require('./models/teacher.model');
const Standard = require('./models/standard.model');
const Subject = require('./models/subject.model');
const School = require('./models/school.model');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to DB');

        // Get the first school admin to use as reference
        const admin = await User.findOne({ role: 'School_Admin' });
        if (!admin) {
            console.error('No School_Admin found. Please create one first.');
            process.exit(1);
        }

        const schoolId = admin.schoolId;
        const schoolAdminId = admin._id;

        const subjectNames = ['Mathematics', 'Science', 'English', 'Hindi', 'Gujarati', 'EVS', 'Computer', 'Art'];
        const levels = [1, 2, 3, 4, 5];

        for (const level of levels) {
            console.log(`Processing Standard ${level}...`);

            // 1. Find or create Standard
            let standard = await Standard.findOne({ schoolId, level });
            if (!standard) {
                standard = await Standard.create({
                    schoolId,
                    level,
                    name: `Standard ${level}`,
                    subjects: []
                });
                console.log(`Created Standard ${level}`);
            }

            for (const subjectName of subjectNames) {
                // 2. Find or create Subject
                let subject = await Subject.findOne({ schoolId, name: subjectName });
                if (!subject) {
                    subject = await Subject.create({
                        schoolId,
                        name: subjectName,
                        code: subjectName.substring(0, 3).toUpperCase(),
                        description: `${subjectName} Subject`
                    });
                    console.log(`Created Subject: ${subjectName}`);
                }

                // Add subject to standard if not already there
                if (!standard.subjects.some(id => id.toString() === subject._id.toString())) {
                    standard.subjects.push(subject._id);
                    await standard.save();
                }

                // 3. Create Teacher for this subject in this standard
                // We'll create a unique teacher per subject per standard for dummy data clarity
                const firstName = subjectName;
                const lastName = `Teacher ${level}`;
                const email = `teacher.std${level}.${subjectName.toLowerCase().replace(/ /g, '')}@example.com`;
                const phone = `9900${level}${subjectNames.indexOf(subjectName)}${Math.floor(Math.random() * 1000)}`.padEnd(10, '0').substring(0, 10);

                // Check if teacher already exists
                const existingTeacher = await Teacher.findOne({ email });
                if (existingTeacher) {
                    console.log(`Teacher ${email} already exists, skipping.`);
                    continue;
                }

                const hashedPassword = await bcrypt.hash(email, 10);

                // Create User record
                const user = await User.create({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    role: 'Teacher',
                    schoolId,
                    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=2563eb&color=fff`,
                });

                // Create Teacher record
                await Teacher.create({
                    schoolId,
                    schoolAdminId,
                    userId: user._id,
                    firstName,
                    lastName,
                    email,
                    phone,
                    qualifications: ['B.Ed', 'M.A.'],
                    joiningDate: new Date()
                });

                console.log(`Created Teacher: ${firstName} ${lastName} (${email})`);
            }
        }

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
