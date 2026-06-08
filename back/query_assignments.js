const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user.model');
const Assignment = require('./models/assignment.model');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected to DB');

  const assignments = await Assignment.find().populate('createdBy', 'firstName lastName');
  console.log(`Total assignments: ${assignments.length}`);
  
  assignments.forEach((a, i) => {
    console.log(`[${i}] Title: ${a.title} | Due Date: ${a.dueDate} | Created At: ${a.createdAt}`);
  });

  process.exit();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
