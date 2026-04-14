require('dotenv').config();
const mongoose = require('mongoose');
const Holiday = require('../models/holiday.model');
const AcademicYear = require('../models/academicYear.model');
const School = require('../models/school.model');

const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_PATH;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables. Please check MONGO_URI or MONGODB_PATH in .env file');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected for holiday migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateHolidays = async () => {
  try {
    console.log('\n🔄 Starting holiday migration...\n');

    // Get all schools
    const schools = await School.find({});
    console.log(`📚 Found ${schools.length} schools\n`);

    let totalUpdated = 0;

    for (const school of schools) {
      console.log(`\n🏫 Processing school: ${school.name} (${school._id})`);

      // Find current academic year for this school
      let academicYear = await AcademicYear.findOne({ 
        schoolId: school._id, 
        isCurrent: true 
      });

      // If no current year, find the most recent one
      if (!academicYear) {
        academicYear = await AcademicYear.findOne({ schoolId: school._id })
          .sort({ startDate: -1 });
      }

      // If still no academic year, create one
      if (!academicYear) {
        const currentYear = new Date().getFullYear();
        academicYear = await AcademicYear.create({
          schoolId: school._id,
          name: `${currentYear}-${currentYear + 1}`,
          startDate: new Date(`${currentYear}-04-01`),
          endDate: new Date(`${currentYear + 1}-03-31`),
          isCurrent: true
        });
        console.log(`   ✨ Created new academic year: ${academicYear.name}`);
      }

      console.log(`   📅 Using academic year: ${academicYear.name} (${academicYear._id})`);

      // Find holidays without academicYearId for this school
      const holidaysToUpdate = await Holiday.find({
        schoolId: school._id,
        academicYearId: { $exists: false }
      });

      if (holidaysToUpdate.length === 0) {
        console.log(`   ✅ No holidays to update for this school`);
        continue;
      }

      console.log(`   🎄 Found ${holidaysToUpdate.length} holidays to update`);

      // Update holidays
      const result = await Holiday.updateMany(
        {
          schoolId: school._id,
          academicYearId: { $exists: false }
        },
        {
          $set: { academicYearId: academicYear._id }
        }
      );

      console.log(`   ✅ Updated ${result.modifiedCount} holidays`);
      totalUpdated += result.modifiedCount;
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Total holidays updated: ${totalUpdated}\n`);

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDb();
    await migrateHolidays();
    console.log('✅ All done! Closing connection...');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

main();
