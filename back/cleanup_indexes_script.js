const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected to DB');

  try {
    await mongoose.connection.db.collection('teachers').dropIndex('employeeId_1');
    console.log('Dropped global employeeId index on teachers collection');
  } catch (err) {
    console.log('Index employeeId_1 not found on teachers (or already dropped)');
  }

  try {
    await mongoose.connection.db.collection('users').dropIndex('employeeId_1');
    console.log('Dropped global employeeId index on users collection');
  } catch (err) {
    console.log('Index employeeId_1 not found on users (or already dropped)');
  }

  await mongoose.disconnect();
}

cleanup();
