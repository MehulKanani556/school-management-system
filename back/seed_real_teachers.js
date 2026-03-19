const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/user.model');
const Teacher = require('./models/teacher.model');
const Standard = require('./models/standard.model');
const Subject = require('./models/subject.model');
const School = require('./models/school.model');

const firstNames = [
    'Archit', 'Mehul', 'Akshay', 'Darshan', 'Jay', 'Pritesh', 'Viral', 'Bhavin', 'Hardik', 'Maulik',
    'Sagar', 'Nitin', 'Rahul', 'Ankit', 'Kishan', 'Ravi', 'Hiren', 'Parth', 'Jignesh', 'Sandip',
    'Piyush', 'Nikunj', 'Umesh', 'Tushar', 'Prashant', 'Deepak', 'Sanjay', 'Ashwin', 'Bhargav', 'Divyesh',
    'Gaurav', 'Inder', 'Jagdish', 'Kamlesh', 'Lalit', 'Manish', 'Narendra', 'Pankaj', 'Rajesh', 'Suresh'
];

const lastNames = [
    'Vaghani', 'Kanani', 'Kalathiya', 'Dobariya', 'Radadiya', 'Savani', 'Gevariya', 'Bhanushali', 'Chotaliya', 'Dangar',
    'Dudhat', 'Goti', 'Italiya', 'Kachhadiya', 'Kalsariya', 'Kheni', 'Kotadiya', 'Lathiya', 'Mavani', 'Nakrani',
    'Padmani', 'Rakholiya', 'Sheladiya', 'Talaviya', 'Usadadiya', 'Vekariya', 'Zalavadiya', 'Hirpara', 'Ramani', 'Sutariya'
];

async function seedRealWorld() {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to DB');

        const admin = await User.findOne({ role: 'School_Admin' });
        if (!admin) {
            console.error('No School_Admin found.');
            process.exit(1);
        }

        const schoolId = admin.schoolId;
        const schoolAdminId = admin._id;

        // Cleanup old dummy data first (by email pattern)
        const dummyUsers = await User.find({ email: /teacher\.std/i });
        const dummyUserIds = dummyUsers.map(u => u._id);
        await Teacher.deleteMany({ userId: { $in: dummyUserIds } });
        await User.deleteMany({ _id: { $in: dummyUserIds } });
        console.log(`Cleaned up ${dummyUserIds.length} dummy teacher records.`);

        const subjectNames = ['Mathematics', 'Science', 'English', 'Hindi', 'Gujarati', 'EVS', 'Computer', 'Art'];
        const levels = [1, 2, 3, 4, 5];

        let nameIndex = 0;

        for (const level of levels) {
            console.log(`Processing Standard ${level}...`);

            for (const subjectName of subjectNames) {
                const firstName = firstNames[nameIndex % firstNames.length];
                const lastName = lastNames[nameIndex % lastNames.length];
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${level}@gmail.com`;
                const phone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

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
                    qualifications: ['B.Sc', 'M.Ed'],
                    joiningDate: new Date()
                });

                console.log(`Created Real-World Teacher: ${firstName} ${lastName} for ${subjectName} (Std ${level}) - Email: ${email}`);
                nameIndex++;
            }
        }

        console.log('Real-world seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedRealWorld();
