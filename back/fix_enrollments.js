const mongoose = require('mongoose');
require('dotenv').config();

const StudentEnrollment = require('./models/studentEnrollment.model');
const ClassSection = require('./models/classSection.model');
const AcademicYear = require('./models/academicYear.model');
const Standard = require('./models/standard.model');

async function fixEnrollments() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB\n');

    // Find enrollments without sections
    const enrollmentsWithoutSection = await StudentEnrollment.find({
      classSectionId: null
    }).populate('standardId academicYearId');

    console.log(`Found ${enrollmentsWithoutSection.length} enrollments without sections\n`);

    if (enrollmentsWithoutSection.length === 0) {
      console.log('No enrollments to fix!');
      return;
    }

    // Group by standard and academic year
    const groups = {};
    for (const enrollment of enrollmentsWithoutSection) {
      const key = `${enrollment.standardId._id}_${enrollment.academicYearId._id}`;
      if (!groups[key]) {
        groups[key] = {
          standardId: enrollment.standardId._id,
          academicYearId: enrollment.academicYearId._id,
          standardName: `Grade ${enrollment.standardId.level}`,
          yearName: enrollment.academicYearId.name,
          enrollments: []
        };
      }
      groups[key].enrollments.push(enrollment);
    }

    // Fix each group
    for (const group of Object.values(groups)) {
      console.log(`\nFixing ${group.enrollments.length} students in ${group.standardName} (${group.yearName})...`);
      
      // Get sections for this standard
      const sections = await ClassSection.find({
        standardId: group.standardId
      }).sort({ sectionLabel: 1 });

      if (sections.length === 0) {
        console.log(`  ⚠️  No sections found for ${group.standardName}`);
        continue;
      }

      console.log(`  Found ${sections.length} sections: ${sections.map(s => s.sectionLabel).join(', ')}`);

      // Distribute students across sections
      for (let i = 0; i < group.enrollments.length; i++) {
        const enrollment = group.enrollments[i];
        const section = sections[i % sections.length];
        
        await StudentEnrollment.findByIdAndUpdate(enrollment._id, {
          classSectionId: section._id
        });
      }

      console.log(`  ✅ Distributed ${group.enrollments.length} students across ${sections.length} sections`);
    }

    console.log('\n✅ All enrollments fixed!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

fixEnrollments();
