require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../models/exam.model');
const Standard = require('../models/standard.model');

async function run() {
  try {
    const mongoUri = process.env.MONGODB_PATH;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const exams = await Exam.find();
    console.log(`Processing ${exams.length} exams...`);

    const standards = await Standard.find().lean();
    console.log(`Loaded ${standards.length} standards.`);

    let updatedCount = 0;
    for (const exam of exams) {
      if (!exam.subject) {
        const standard = standards.find(s => s._id.toString() === exam.standardId.toString());
        if (standard && standard.subjects && standard.subjects.length > 0) {
          // Select subject deterministically based on exam name/ID to make it repeatable and clean
          const index = exam._id.toString().charCodeAt(exam._id.toString().length - 1) % standard.subjects.length;
          const subjectId = standard.subjects[index];
          
          exam.subject = subjectId;
          await exam.save();
          updatedCount++;
        }
      }
    }

    console.log(`Successfully assigned subjects to ${updatedCount} exams.`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

run();
