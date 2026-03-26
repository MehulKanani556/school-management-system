const mongoose = require('mongoose');
const User = require('./models/user.model');
const Teacher = require('./models/teacher.model');
const Student = require('./models/student.model');
require('dotenv').config();

async function initIndexes() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected to DB');

  console.log('Syncing User indexes...');
  await User.init();
  console.log('Syncing Teacher indexes...');
  await Teacher.init();
  console.log('Syncing Student indexes...');
  await Student.init();

  const collections = ['teachers', 'users', 'students'];
  for (const col of collections) {
      console.log(`\n--- ${col} Indexes ---`);
      const inds = await mongoose.connection.db.collection(col).indexes();
      console.table(inds.map(idx => ({ name: idx.name, key: JSON.stringify(idx.key), unique: idx.unique })));
  }

  console.log('Index synchronization complete');
  await mongoose.disconnect();
}

initIndexes();
