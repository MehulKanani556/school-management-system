const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/student.model');

async function list() {
  await mongoose.connect(process.env.MONGODB_PATH);
  const students = await Student.find({}, { admissionNumber: 1, password: 1, firstName: 1 }).limit(10).lean();
  console.log(students);
  await mongoose.disconnect();
}
list();
