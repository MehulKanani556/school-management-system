const mongoose = require('mongoose');
const User = require('./models/user.model');
const Teacher = require('./models/teacher.model');
require('dotenv').config();

async function initIndexes() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected to DB');

  console.log('Syncing User indexes...');
  await User.init();
  console.log('Syncing Teacher indexes...');
  await Teacher.init();

  const teacherIndexes = await mongoose.connection.db.collection('teachers').indexes();
  console.table(teacherIndexes.slice(0, 10).map(idx => ({ name: idx.name, key: JSON.stringify(idx.key), unique: idx.unique })));

  const userIndexes = await mongoose.connection.db.collection('users').indexes();
  console.table(userIndexes.slice(0, 10).map(idx => ({ name: idx.name, key: JSON.stringify(idx.key), unique: idx.unique })));

  console.log('Index synchronization complete');
  await mongoose.disconnect();
}

initIndexes();
