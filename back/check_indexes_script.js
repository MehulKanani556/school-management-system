const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected to DB');

  const teacherIndexes = await mongoose.connection.db.collection('teachers').indexes();
  console.log('\n--- Teacher Indexes ---');
  console.table(teacherIndexes.map(idx => ({ name: idx.name, key: JSON.stringify(idx.key), unique: idx.unique })));

  const userIndexes = await mongoose.connection.db.collection('users').indexes();
  console.log('\n--- User Indexes ---');
  console.table(userIndexes.map(idx => ({ name: idx.name, key: JSON.stringify(idx.key), unique: idx.unique })));

  await mongoose.disconnect();
}

check();
