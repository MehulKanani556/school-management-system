const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./models/teacher.model');
const User = require('./models/user.model');
const Payroll = require('./models/payroll.model');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected');

    const user = await User.findOne({ email: 'harsh.mehta.48.teacher@vidyamandir.edu.in' });
    if (!user) {
      console.log('Teacher user not found');
      process.exit(1);
    }
    const teacher = await Teacher.findOne({ userId: user._id });
    if (!teacher) {
      console.log('Teacher profile not found');
      process.exit(1);
    }
    console.log(`Teacher: Harsh Mehta (ID: ${teacher._id})`);

    const payrolls = await Payroll.find({ teacherId: teacher._id });
    console.log(`Payrolls found for Harsh Mehta: ${payrolls.length}`);
    for (const p of payrolls) {
      console.log(`- Year: ${p.year}, Month: ${p.month}, Net: ${p.netSalary}, Status: ${p.status}`);
    }

    const allPayrolls = await Payroll.find({});
    console.log(`Total payroll records in database: ${allPayrolls.length}`);
    if (allPayrolls.length > 0) {
      console.log('Sample payroll record:', allPayrolls[0]);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
