const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB\n');

    // Drop all collections for the school
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections\n`);

    for (const collection of collections) {
      if (collection.name !== 'schools' && collection.name !== 'users') {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        await mongoose.connection.db.collection(collection.name).deleteMany({});
        console.log(`Cleared ${collection.name}: ${count} documents`);
      }
    }

    // Keep only Super_Admin and School_Admin users
    const User = require('./models/user.model');
    const result = await User.deleteMany({ 
      role: { $nin: ['Super_Admin', 'School_Admin'] } 
    });
    console.log(`\nCleared ${result.deletedCount} non-admin users`);

    console.log('\nDatabase cleaned successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

cleanup();
