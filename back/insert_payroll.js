const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./models/teacher.model');
const User = require('./models/user.model');
const Payroll = require('./models/payroll.model');
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

    // Find a School Admin to act as submitter
    const adminUser = await User.findOne({ role: 'School_Admin' });
    if (!adminUser) {
      console.error('School Admin user not found');
      process.exit(1);
    }

    // Find the school
    const school = await School.findOne();
    if (!school) {
      console.error('School not found');
      process.exit(1);
    }

    // Find all academic years
    const academicYears = await AcademicYear.find().sort({ startDate: 1 });
    console.log(`Found ${academicYears.length} academic years`);

    // Let's clear any existing payroll records for this teacher first
    const deleteResult = await Payroll.deleteMany({ teacherId: teacher._id });
    console.log(`Cleared ${deleteResult.deletedCount} existing payroll records for Harsh Mehta`);

    // Create payroll records for each academic year
    const basic = teacherUser.baseSalary || 48000;

    for (const acYr of academicYears) {
      const startYear = new Date(acYr.startDate).getFullYear();
      // Seed for months: 6 (June), 10 (October), 1 (January of next year)
      const months = [6, 10, 1];

      for (const m of months) {
        const calYear = m === 1 ? startYear + 1 : startYear;
        const isUnpaid = acYr.name === '2026-2027' && m === 1; // Mark Jan 2027 as unpaid for the current year
        const bonus = m === 10 ? 5000 : 1500;
        const deductions = 1500;
        const netSalary = basic + bonus - deductions;

        const payrollRecord = {
          schoolId: school._id,
          teacherId: teacher._id,
          userId: teacherUser._id,
          month: m,
          year: calYear,
          basicSalary: basic,
          bonus,
          deductions,
          netSalary,
          status: isUnpaid ? 'unpaid' : 'paid',
          paidAt: isUnpaid ? null : new Date(calYear, m - 1, 15, 10, 0, 0),
          paymentMethod: 'Bank Transfer',
          transactionId: isUnpaid ? null : `SAL${calYear}${m}${Math.floor(1000 + Math.random() * 9000)}`,
          submittedBy: adminUser._id,
          remarks: `Salary — ${acYr.name}`,
        };

        const created = await Payroll.create(payrollRecord);
        console.log(`Created payroll for ${acYr.name} (Month: ${m}, Year: ${calYear}) - ID: ${created._id}`);
      }
    }

    console.log('Successfully completed seeding payroll for Harsh Mehta!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
