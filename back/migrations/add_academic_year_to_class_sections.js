require('dotenv').config();
const mongoose = require('mongoose');
const ClassSection = require('../models/classSection.model');
const AcademicYear = require('../models/academicYear.model');
const StudentEnrollment = require('../models/studentEnrollment.model');
const Standard = require('../models/standard.model');

async function migrateClassSections() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Drop old indexes
    console.log('📋 Step 1: Dropping old unique indexes...');
    try {
      await ClassSection.collection.dropIndex('schoolId_1_standardId_1_sectionLabel_1');
      console.log('   ✅ Dropped: schoolId_1_standardId_1_sectionLabel_1');
    } catch (e) {
      console.log('   ⚠️  Index not found or already dropped');
    }
    
    try {
      await ClassSection.collection.dropIndex('schoolId_1_classTeacher_1');
      console.log('   ✅ Dropped: schoolId_1_classTeacher_1');
    } catch (e) {
      console.log('   ⚠️  Index not found or already dropped');
    }

    // Step 2: Get all academic years
    console.log('\n📅 Step 2: Fetching academic years...');
    const academicYears = await AcademicYear.find().sort({ startDate: 1 });
    console.log(`   Found ${academicYears.length} academic years:`);
    academicYears.forEach(y => console.log(`   - ${y.name} (${y._id})`));

    if (academicYears.length === 0) {
      console.log('\n❌ No academic years found. Please create academic years first.');
      process.exit(1);
    }

    // Step 3: Get existing class sections
    console.log('\n🏫 Step 3: Fetching existing class sections...');
    const existingSections = await ClassSection.find()
      .populate('standardId', 'level name')
      .lean();
    console.log(`   Found ${existingSections.length} existing class sections`);

    if (existingSections.length === 0) {
      console.log('\n✅ No existing sections to migrate. Migration complete.');
      process.exit(0);
    }

    // Step 4: Check which sections already have academicYearId
    const sectionsWithYear = existingSections.filter(s => s.academicYearId);
    const sectionsWithoutYear = existingSections.filter(s => !s.academicYearId);
    
    console.log(`   - Sections with academicYearId: ${sectionsWithYear.length}`);
    console.log(`   - Sections without academicYearId: ${sectionsWithoutYear.length}`);

    if (sectionsWithoutYear.length === 0) {
      console.log('\n✅ All sections already have academicYearId. Migration complete.');
      process.exit(0);
    }

    // Step 5: For each section without year, check which years have enrollments
    console.log('\n🔄 Step 4: Analyzing enrollments and creating year-specific sections...');
    
    const newSections = [];
    const sectionsToDelete = [];

    for (const section of sectionsWithoutYear) {
      console.log(`\n   Processing: Grade ${section.standardId?.level} - Section ${section.sectionLabel}`);
      
      // Find which academic years have students enrolled in this section
      const enrollments = await StudentEnrollment.find({
        classSectionId: section._id
      }).distinct('academicYearId');

      console.log(`     Found enrollments in ${enrollments.length} academic year(s)`);

      if (enrollments.length === 0) {
        // No enrollments - assign to current academic year
        const currentYear = academicYears.find(y => y.isCurrent) || academicYears[0];
        console.log(`     No enrollments found. Assigning to current year: ${currentYear.name}`);
        
        newSections.push({
          ...section,
          _id: undefined,
          academicYearId: currentYear._id,
          createdAt: section.createdAt,
          updatedAt: new Date()
        });
      } else {
        // Create a section for each year that has enrollments
        for (const yearId of enrollments) {
          const year = academicYears.find(y => y._id.toString() === yearId.toString());
          console.log(`     Creating section for year: ${year?.name || yearId}`);
          
          newSections.push({
            ...section,
            _id: undefined,
            academicYearId: yearId,
            createdAt: section.createdAt,
            updatedAt: new Date()
          });
        }
      }

      // Mark old section for deletion
      sectionsToDelete.push(section._id);
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Sections to create: ${newSections.length}`);
    console.log(`   - Old sections to delete: ${sectionsToDelete.length}`);

    // Step 6: Create new sections
    console.log('\n💾 Step 5: Creating new year-specific sections...');
    const created = await ClassSection.insertMany(newSections);
    console.log(`   ✅ Created ${created.length} new sections`);

    // Step 7: Update enrollments to point to new sections
    console.log('\n🔗 Step 6: Updating student enrollments...');
    let updatedEnrollments = 0;
    
    for (const oldSection of sectionsWithoutYear) {
      // Find all new sections created from this old section
      const relatedNewSections = created.filter(ns => 
        ns.standardId.toString() === oldSection.standardId._id.toString() &&
        ns.sectionLabel === oldSection.sectionLabel &&
        ns.schoolId.toString() === oldSection.schoolId.toString()
      );

      for (const newSection of relatedNewSections) {
        // Update enrollments for this academic year
        const result = await StudentEnrollment.updateMany(
          {
            classSectionId: oldSection._id,
            academicYearId: newSection.academicYearId
          },
          {
            $set: { classSectionId: newSection._id }
          }
        );
        updatedEnrollments += result.modifiedCount;
      }
    }
    console.log(`   ✅ Updated ${updatedEnrollments} enrollment records`);

    // Step 8: Delete old sections
    console.log('\n🗑️  Step 7: Removing old sections...');
    const deleteResult = await ClassSection.deleteMany({
      _id: { $in: sectionsToDelete }
    });
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} old sections`);

    // Step 9: Create new indexes
    console.log('\n📋 Step 8: Creating new indexes...');
    await ClassSection.collection.createIndex(
      { schoolId: 1, academicYearId: 1, standardId: 1, sectionLabel: 1 },
      { unique: true }
    );
    console.log('   ✅ Created: schoolId_1_academicYearId_1_standardId_1_sectionLabel_1');
    
    await ClassSection.collection.createIndex(
      { schoolId: 1, academicYearId: 1, classTeacher: 1 },
      { unique: true }
    );
    console.log('   ✅ Created: schoolId_1_academicYearId_1_classTeacher_1');

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Created ${created.length} year-specific sections`);
    console.log(`   - Updated ${updatedEnrollments} enrollment records`);
    console.log(`   - Deleted ${deleteResult.deletedCount} old sections`);
    console.log(`   - Class sections are now academic year-specific`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateClassSections();
