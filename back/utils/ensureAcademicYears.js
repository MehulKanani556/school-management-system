/**
 * Utility to ensure all schools have at least one academic year
 * Run this if you're getting "Academic Year is required" errors
 * 
 * Usage: node back/utils/ensureAcademicYears.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const School = require('../models/school.model');
const AcademicYear = require('../models/academicYear.model');

const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_PATH;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const ensureAcademicYears = async () => {
  try {
    console.log('\n🔍 Checking schools for academic years...\n');

    const schools = await School.find({});
    console.log(`Found ${schools.length} schools\n`);

    let created = 0;
    let updated = 0;

    for (const school of schools) {
      console.log(`📚 Checking school: ${school.name} (${school._id})`);

      // Check if school has any academic years
      const existingYears = await AcademicYear.find({ schoolId: school._id });
      
      if (existingYears.length === 0) {
        // Create a default academic year
        const currentYear = new Date().getFullYear();
        const academicYear = await AcademicYear.create({
          schoolId: school._id,
          name: `${currentYear}-${currentYear + 1}`,
          startDate: new Date(currentYear, 3, 1), // April 1st
          endDate: new Date(currentYear + 1, 2, 31), // March 31st next year
          isCurrent: true
        });
        console.log(`  ✅ Created academic year: ${academicYear.name}`);
        created++;
      } else {
        // Check if any year is marked as current
        const currentYear = existingYears.find(y => y.isCurrent);
        
        if (!currentYear) {
          // Mark the most recent year as current
          const mostRecent = existingYears.sort((a, b) => 
            new Date(b.startDate) - new Date(a.startDate)
          )[0];
          
          mostRecent.isCurrent = true;
          await mostRecent.save();
          console.log(`  ✅ Set ${mostRecent.name} as current academic year`);
          updated++;
        } else {
          console.log(`  ℹ️  Already has current academic year: ${currentYear.name}`);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  - Schools checked: ${schools.length}`);
    console.log(`  - Academic years created: ${created}`);
    console.log(`  - Current years set: ${updated}`);
    console.log('\n✅ All schools now have academic years!\n');

  } catch (err) {
    console.error('\n❌ Error:', err);
    throw err;
  }
};

const main = async () => {
  try {
    await connectDb();
    await ensureAcademicYears();
    console.log('🎉 Done! Closing connection...\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ensureAcademicYears };
