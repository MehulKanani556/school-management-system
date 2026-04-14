/**
 * Migration Script: Add academicYearId to existing records
 * 
 * This script updates existing records in the database to include academicYearId
 * based on the current active academic year for each school.
 * 
 * Run this ONCE after deploying the model changes.
 * 
 * Usage: node back/migrations/add_academic_year_to_existing_records.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Models
const AcademicYear = require('../models/academicYear.model');
const Submission = require('../models/submission.model');
const LessonPlan = require('../models/lessonPlan.model');
const BehaviorLog = require('../models/behaviorLog.model');
const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quizAttempt.model');
const School = require('../models/school.model');

const connectDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_PATH;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables. Please set MONGO_URI or MONGODB_PATH in .env file');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const migrateRecords = async () => {
  try {
    console.log('\n🔄 Starting migration...\n');

    // Get all schools
    const schools = await School.find({});
    console.log(`Found ${schools.length} schools\n`);

    for (const school of schools) {
      console.log(`\n📚 Processing school: ${school.name} (${school._id})`);

      // Find current academic year for this school
      let academicYear = await AcademicYear.findOne({ 
        schoolId: school._id, 
        isCurrent: true 
      });

      // If no current year, try to find the most recent one
      if (!academicYear) {
        academicYear = await AcademicYear.findOne({ schoolId: school._id })
          .sort({ startDate: -1 });
      }

      // If still no academic year, create a default one
      if (!academicYear) {
        console.log(`  ⚠️  No academic year found. Creating default...`);
        const currentYear = new Date().getFullYear();
        academicYear = await AcademicYear.create({
          schoolId: school._id,
          name: `${currentYear}-${currentYear + 1}`,
          startDate: new Date(currentYear, 3, 1), // April 1st
          endDate: new Date(currentYear + 1, 2, 31), // March 31st
          isCurrent: true
        });
        console.log(`  ✅ Created academic year: ${academicYear.name}`);
      }

      console.log(`  📅 Using academic year: ${academicYear.name} (${academicYear._id})`);

      // Update Submissions
      const submissionsResult = await Submission.updateMany(
        { 
          schoolId: school._id, 
          academicYearId: { $exists: false } 
        },
        { $set: { academicYearId: academicYear._id } }
      );
      console.log(`  ✅ Updated ${submissionsResult.modifiedCount} Submissions`);

      // Update LessonPlans
      const lessonPlansResult = await LessonPlan.updateMany(
        { 
          schoolId: school._id, 
          academicYearId: { $exists: false } 
        },
        { $set: { academicYearId: academicYear._id } }
      );
      console.log(`  ✅ Updated ${lessonPlansResult.modifiedCount} Lesson Plans`);

      // Update BehaviorLogs
      const behaviorLogsResult = await BehaviorLog.updateMany(
        { 
          schoolId: school._id, 
          academicYearId: { $exists: false } 
        },
        { $set: { academicYearId: academicYear._id } }
      );
      console.log(`  ✅ Updated ${behaviorLogsResult.modifiedCount} Behavior Logs`);

      // Update Quizzes
      const quizzesResult = await Quiz.updateMany(
        { 
          schoolId: school._id, 
          academicYearId: { $exists: false } 
        },
        { $set: { academicYearId: academicYear._id } }
      );
      console.log(`  ✅ Updated ${quizzesResult.modifiedCount} Quizzes`);

      // Update QuizAttempts
      const quizAttemptsResult = await QuizAttempt.updateMany(
        { 
          schoolId: school._id, 
          academicYearId: { $exists: false } 
        },
        { $set: { academicYearId: academicYear._id } }
      );
      console.log(`  ✅ Updated ${quizAttemptsResult.modifiedCount} Quiz Attempts`);
    }

    console.log('\n\n✅ Migration completed successfully!\n');
  } catch (err) {
    console.error('\n❌ Migration error:', err);
    throw err;
  }
};

const main = async () => {
  try {
    await connectDb();
    await migrateRecords();
    console.log('🎉 All done! Closing connection...\n');
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

module.exports = { migrateRecords };
