const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_PATH);
  console.log('Connected to DB');

  const collections = ['teachers', 'users', 'students'];
  const indexesToDrop = ['employeeId_1', 'admissionNumber_1'];

  for (const col of collections) {
    for (const idx of indexesToDrop) {
      try {
        await mongoose.connection.db.collection(col).dropIndex(idx);
        console.log(`Dropped global index ${idx} on ${col} collection`);
      } catch (err) {
        // console.log(`Index ${idx} not found on ${col} (or already dropped)`);
      }
    }
  }

  await mongoose.disconnect();
}

cleanup();
