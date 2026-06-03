const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./models/teacher.model');
const User = require('./models/user.model');
const Review = require('./models/review.model');
const School = require('./models/school.model');
const AcademicYear = require('./models/academicYear.model');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB');

    // Find the teacher Harsh Mehta
    const teacherUser = await User.findOne({ email: 'harsh.mehta.48.teacher@vidyamandir.edu.in' });
    if (!teacherUser) {
      console.error('Teacher user not found');
      process.exit(1);
    }
    const teacher = await Teacher.findOne({ userId: teacherUser._id });
    if (!teacher) {
      console.error('Teacher profile not found');
      process.exit(1);
    }
    console.log(`Found teacher: ${teacherUser.firstName} ${teacherUser.lastName} (ID: ${teacher._id})`);

    // Find a School Admin to act as reviewer
    const adminUser = await User.findOne({ role: 'School_Admin' });
    if (!adminUser) {
      console.error('School Admin user not found');
      process.exit(1);
    }
    console.log(`Found reviewer admin: ${adminUser.firstName} ${adminUser.lastName} (ID: ${adminUser._id})`);

    // Find the school
    const school = await School.findOne();
    if (!school) {
      console.error('School not found');
      process.exit(1);
    }
    console.log(`Found school: ${school.name} (ID: ${school._id})`);

    // Find academic year 2026-2027
    const year26 = await AcademicYear.findOne({ name: '2026-2027' });
    if (!year26) {
      console.error('Academic year 2026-2027 not found');
      process.exit(1);
    }
    console.log(`Found Academic Year: ${year26.name} (ID: ${year26._id})`);

    // Let's clear any existing reviews for this teacher first to prevent duplicates if running again
    await Review.deleteMany({ teacherId: teacher._id });
    console.log('Cleared existing reviews for this teacher');

    // Create 3 reviews
    const reviewsData = [
      {
        schoolId: school._id,
        teacherId: teacher._id,
        reviewerId: adminUser._id,
        academicYearId: year26._id,
        rating: 5,
        comments: 'Excellent pedagogy! Harsh consistently demonstrates outstanding commitment to teaching. Lesson plans are always well-prepared, and student engagement is high. Keeps parent communications active and professional.',
        date: new Date('2026-05-15T10:00:00Z')
      },
      {
        schoolId: school._id,
        teacherId: teacher._id,
        reviewerId: adminUser._id,
        academicYearId: year26._id,
        rating: 4,
        comments: 'Strong performance throughout the academic cycle. High curriculum compliance. Attends PTMs regularly and shows positive behavioral feedback management. Minor improvement suggested in resolving student support tickets faster.',
        date: new Date('2026-05-20T10:00:00Z')
      },
      {
        schoolId: school._id,
        teacherId: teacher._id,
        reviewerId: adminUser._id,
        academicYearId: year26._id,
        rating: 5,
        comments: 'Outstanding leadership in student conduct registry and attendance tracking. Shows deep mastery of subject matter and provides timely result entries. Highly recommended for senior pedagogical mentorship program.',
        date: new Date('2026-05-28T10:00:00Z')
      }
    ];

    for (const r of reviewsData) {
      const review = await Review.create(r);
      console.log(`Created review ID: ${review._id} with rating ${review.rating}`);
    }

    console.log('Successfully inserted reviews!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
