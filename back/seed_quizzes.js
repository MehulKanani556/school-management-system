/**
 * seed_quizzes.js
 * Seeds Quiz, Question, and QuizAttempt data using real DB records.
 * Run: node back/seed_quizzes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User        = require('./models/user.model');
const Teacher     = require('./models/teacher.model');
const Standard    = require('./models/standard.model');
const Subject     = require('./models/subject.model');
const Student     = require('./models/student.model');
const ClassSection = require('./models/classSection.model');
const Quiz        = require('./models/quiz.model');
const Question    = require('./models/question.model');
const QuizAttempt = require('./models/quizAttempt.model');

// ─── Quiz Content Bank ────────────────────────────────────────────────────────
// Each entry maps to a subject name (case-insensitive partial match)
const QUIZ_BANK = [
  {
    subjectMatch: 'math',
    quizzes: [
      {
        title: 'Arithmetic Fundamentals',
        description: 'Basic operations, fractions and decimals.',
        duration: 20,
        passingScore: 50,
        questions: [
          { text: 'What is 15 × 8?',                          options: ['100', '110', '120', '130'],          correctAnswer: 2, points: 10 },
          { text: 'Simplify: 3/4 + 1/4',                      options: ['1', '2', '3/8', '4/4'],             correctAnswer: 0, points: 10 },
          { text: 'What is 144 ÷ 12?',                        options: ['10', '11', '12', '13'],             correctAnswer: 2, points: 10 },
          { text: 'Which is a prime number?',                  options: ['9', '15', '17', '21'],              correctAnswer: 2, points: 10 },
          { text: 'What is 25% of 200?',                      options: ['25', '50', '75', '100'],            correctAnswer: 1, points: 10 },
        ]
      },
      {
        title: 'Geometry Basics',
        description: 'Shapes, angles, area and perimeter.',
        duration: 25,
        passingScore: 60,
        questions: [
          { text: 'How many sides does a hexagon have?',       options: ['5', '6', '7', '8'],                 correctAnswer: 1, points: 10 },
          { text: 'Area of a rectangle 5cm × 4cm?',           options: ['9 cm²', '18 cm²', '20 cm²', '25 cm²'], correctAnswer: 2, points: 10 },
          { text: 'Sum of angles in a triangle?',             options: ['90°', '180°', '270°', '360°'],      correctAnswer: 1, points: 10 },
          { text: 'Perimeter of a square with side 6cm?',     options: ['12 cm', '18 cm', '24 cm', '36 cm'], correctAnswer: 2, points: 10 },
          { text: 'What is the radius if diameter is 10cm?',  options: ['2 cm', '5 cm', '10 cm', '20 cm'],  correctAnswer: 1, points: 10 },
        ]
      }
    ]
  },
  {
    subjectMatch: 'science',
    quizzes: [
      {
        title: 'Living World',
        description: 'Plants, animals and ecosystems.',
        duration: 20,
        passingScore: 50,
        questions: [
          { text: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 2, points: 10 },
          { text: 'What is the powerhouse of the cell?',               options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Vacuole'],   correctAnswer: 1, points: 10 },
          { text: 'Which is a cold-blooded animal?',                   options: ['Dog', 'Frog', 'Cow', 'Eagle'],                      correctAnswer: 1, points: 10 },
          { text: 'Photosynthesis occurs in which part of a plant?',   options: ['Root', 'Stem', 'Leaf', 'Flower'],                   correctAnswer: 2, points: 10 },
          { text: 'What do herbivores eat?',                           options: ['Meat', 'Plants', 'Both', 'Insects'],                correctAnswer: 1, points: 10 },
        ]
      },
      {
        title: 'Forces and Motion',
        description: 'Newton\'s laws, gravity and friction.',
        duration: 25,
        passingScore: 60,
        questions: [
          { text: 'What is the SI unit of force?',                     options: ['Watt', 'Joule', 'Newton', 'Pascal'],                correctAnswer: 2, points: 10 },
          { text: 'Which force pulls objects toward Earth?',           options: ['Friction', 'Gravity', 'Tension', 'Magnetic'],       correctAnswer: 1, points: 10 },
          { text: 'An object at rest stays at rest due to?',           options: ['Gravity', 'Friction', 'Inertia', 'Momentum'],       correctAnswer: 2, points: 10 },
          { text: 'Speed = Distance ÷ ?',                              options: ['Mass', 'Force', 'Time', 'Acceleration'],            correctAnswer: 2, points: 10 },
          { text: 'Which has more inertia: a truck or a bicycle?',     options: ['Bicycle', 'Truck', 'Both equal', 'Depends on speed'], correctAnswer: 1, points: 10 },
        ]
      }
    ]
  },
  {
    subjectMatch: 'english',
    quizzes: [
      {
        title: 'Grammar Essentials',
        description: 'Nouns, verbs, adjectives and tenses.',
        duration: 20,
        passingScore: 50,
        questions: [
          { text: 'Which is a proper noun?',                           options: ['city', 'river', 'London', 'mountain'],              correctAnswer: 2, points: 10 },
          { text: 'Identify the verb: "She runs every morning."',      options: ['She', 'runs', 'every', 'morning'],                  correctAnswer: 1, points: 10 },
          { text: '"Beautiful" is an example of?',                     options: ['Noun', 'Verb', 'Adjective', 'Adverb'],              correctAnswer: 2, points: 10 },
          { text: 'Past tense of "go"?',                               options: ['goed', 'gone', 'went', 'going'],                    correctAnswer: 2, points: 10 },
          { text: 'Which sentence is correct?',                        options: ['He go to school.', 'He goes to school.', 'He going to school.', 'He gone to school.'], correctAnswer: 1, points: 10 },
        ]
      }
    ]
  },
  {
    subjectMatch: 'computer',
    quizzes: [
      {
        title: 'Computer Fundamentals',
        description: 'Hardware, software and basic operations.',
        duration: 20,
        passingScore: 50,
        questions: [
          { text: 'CPU stands for?',                                   options: ['Central Processing Unit', 'Computer Power Unit', 'Central Power Unit', 'Core Processing Unit'], correctAnswer: 0, points: 10 },
          { text: 'Which is an input device?',                         options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'],        correctAnswer: 2, points: 10 },
          { text: 'RAM stands for?',                                   options: ['Read Access Memory', 'Random Access Memory', 'Rapid Access Memory', 'Read All Memory'], correctAnswer: 1, points: 10 },
          { text: 'Which is an operating system?',                     options: ['MS Word', 'Windows', 'Chrome', 'Photoshop'],        correctAnswer: 1, points: 10 },
          { text: 'The internet was invented in which decade?',        options: ['1960s', '1970s', '1980s', '1990s'],                 correctAnswer: 0, points: 10 },
        ]
      }
    ]
  },
  {
    subjectMatch: 'hindi',
    quizzes: [
      {
        title: 'Hindi Vyakaran',
        description: 'Basic Hindi grammar and vocabulary.',
        duration: 20,
        passingScore: 50,
        questions: [
          { text: '"सूर्य" का अर्थ क्या है?',                          options: ['Moon', 'Star', 'Sun', 'Sky'],                       correctAnswer: 2, points: 10 },
          { text: '"पुस्तक" किस लिंग का शब्द है?',                    options: ['पुल्लिंग', 'स्त्रीलिंग', 'नपुंसकलिंग', 'उभयलिंग'], correctAnswer: 1, points: 10 },
          { text: '"खाना" क्रिया का भूतकाल क्या है?',                  options: ['खाएगा', 'खाता है', 'खाया', 'खा रहा है'],           correctAnswer: 2, points: 10 },
          { text: '"आकाश" का पर्यायवाची शब्द?',                       options: ['धरती', 'नभ', 'जल', 'पवन'],                         correctAnswer: 1, points: 10 },
          { text: 'हिंदी वर्णमाला में कितने स्वर हैं?',               options: ['10', '11', '12', '13'],                             correctAnswer: 1, points: 10 },
        ]
      }
    ]
  },
  {
    subjectMatch: 'evs',
    quizzes: [
      {
        title: 'Our Environment',
        description: 'Nature, pollution and conservation.',
        duration: 15,
        passingScore: 50,
        questions: [
          { text: 'Which is a renewable source of energy?',            options: ['Coal', 'Petroleum', 'Solar', 'Natural Gas'],        correctAnswer: 2, points: 10 },
          { text: 'What causes air pollution?',                        options: ['Planting trees', 'Vehicle exhaust', 'Rain', 'Wind'], correctAnswer: 1, points: 10 },
          { text: 'The process of water cycle starts with?',           options: ['Condensation', 'Precipitation', 'Evaporation', 'Collection'], correctAnswer: 2, points: 10 },
          { text: 'Which gas makes up most of Earth\'s atmosphere?',   options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctAnswer: 2, points: 10 },
          { text: 'Deforestation means?',                              options: ['Planting trees', 'Cutting down forests', 'Watering plants', 'Growing crops'], correctAnswer: 1, points: 10 },
        ]
      }
    ]
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysAgo));
  return d;
}

function matchSubject(subjectName, keyword) {
  return subjectName.toLowerCase().includes(keyword.toLowerCase());
}

// ─── Main Seed ────────────────────────────────────────────────────────────────
async function seedQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('✅ Connected to DB\n');

    // ── 1. Resolve school ──────────────────────────────────────────────────────
    const admin = await User.findOne({ role: 'School_Admin' });
    if (!admin) { console.error('❌ No School_Admin found.'); process.exit(1); }
    const schoolId = admin.schoolId;
    console.log(`🏫 School ID: ${schoolId}`);

    // ── 2. Clean previous quiz seed data ──────────────────────────────────────
    const existingQuizzes = await Quiz.find({ schoolId });
    if (existingQuizzes.length > 0) {
      const qIds = existingQuizzes.map(q => q._id);
      await QuizAttempt.deleteMany({ quizId: { $in: qIds } });
      await Question.deleteMany({ quizId: { $in: qIds } });
      await Quiz.deleteMany({ _id: { $in: qIds } });
      console.log(`🗑️  Cleared ${existingQuizzes.length} existing quizzes and related data.\n`);
    }

    // ── 3. Load real DB records ────────────────────────────────────────────────
    const subjects   = await Subject.find({ schoolId });
    const standards  = await Standard.find({ schoolId }).sort({ level: 1 });
    const teachers   = await Teacher.find({ schoolId, isActive: { $ne: false } }).populate('userId', '_id');
    const students   = await Student.find({ schoolId, isActive: true, deletedAt: null })
                                    .populate('standard classSection');

    if (!subjects.length)  { console.error('❌ No subjects found. Run seed_teachers.js first.'); process.exit(1); }
    if (!standards.length) { console.error('❌ No standards found. Run seed_teachers.js first.'); process.exit(1); }
    if (!teachers.length)  { console.error('❌ No teachers found. Run seed_teachers.js first.'); process.exit(1); }
    if (!students.length)  { console.warn('⚠️  No students found — quizzes will be created but no attempts seeded.'); }

    console.log(`📚 Found: ${subjects.length} subjects, ${standards.length} standards, ${teachers.length} teachers, ${students.length} students\n`);

    // ── 4. Pick a teacher user ID (use first available teacher with a userId) ──
    const teacherWithUser = teachers.find(t => t.userId);
    if (!teacherWithUser) { console.error('❌ No teacher with linked userId found.'); process.exit(1); }
    const createdByUserId = teacherWithUser.userId._id;
    console.log(`👨‍🏫 Quizzes will be created by teacher: ${teacherWithUser.firstName} ${teacherWithUser.lastName}\n`);

    // ── 5. Create quizzes ──────────────────────────────────────────────────────
    let totalQuizzes = 0;
    let totalQuestions = 0;
    let totalAttempts = 0;

    for (const bank of QUIZ_BANK) {
      // Find matching subject
      const subject = subjects.find(s => matchSubject(s.name, bank.subjectMatch));
      if (!subject) {
        console.log(`⚠️  No subject matching "${bank.subjectMatch}" — skipping.`);
        continue;
      }

      // Create quizzes for each standard that has this subject
      for (const standard of standards) {
        // Find students in this standard
        const stdStudents = students.filter(s =>
          s.standard && s.standard._id.toString() === standard._id.toString()
        );

        for (const quizData of bank.quizzes) {
          // ── Create Questions ──
          const createdQuestions = await Promise.all(
            quizData.questions.map(q =>
              Question.create({
                quizId: new mongoose.Types.ObjectId(), // temp, updated below
                text: q.text,
                options: q.options,
                correctAnswer: q.correctAnswer,
                points: q.points
              })
            )
          );

          // ── Create Quiz ──
          const quiz = await Quiz.create({
            title: quizData.title,
            description: quizData.description,
            subjectId: subject._id,
            standardId: standard._id,
            schoolId,
            createdBy: createdByUserId,
            duration: quizData.duration,
            passingScore: quizData.passingScore,
            isPublished: true,
            questions: createdQuestions.map(q => q._id)
          });

          // ── Back-fill quizId on questions ──
          await Question.updateMany(
            { _id: { $in: createdQuestions.map(q => q._id) } },
            { quizId: quiz._id }
          );

          totalQuizzes++;
          totalQuestions += createdQuestions.length;
          console.log(`  ✅ Quiz: "${quiz.title}" | Subject: ${subject.name} | Grade ${standard.level} | ${createdQuestions.length} questions`);

          // ── Create Attempts for students in this standard ──
          if (stdStudents.length === 0) continue;

          // Each student has a 70% chance of having attempted this quiz
          const attemptingStudents = stdStudents.filter(() => Math.random() < 0.7);

          for (const student of attemptingStudents) {
            // Simulate answers — student gets 60-100% correct randomly
            const accuracy = 0.6 + Math.random() * 0.4;
            let score = 0;
            let totalPoints = 0;

            const answers = createdQuestions.map(q => {
              const isCorrect = Math.random() < accuracy;
              const selectedOption = isCorrect
                ? q.correctAnswer
                : (q.correctAnswer + randomInt(1, 3)) % 4; // wrong answer
              if (isCorrect) score += q.points;
              totalPoints += q.points;
              return {
                questionId: q._id,
                selectedOption,
                isCorrect
              };
            });

            const percentage = (score / totalPoints) * 100;
            const status = percentage >= quiz.passingScore ? 'Passed' : 'Failed';

            await QuizAttempt.create({
              quizId: quiz._id,
              studentId: student._id,
              schoolId,
              answers,
              score,
              totalPoints,
              status,
              submittedAt: randomDate(30),
              createdAt: randomDate(30)
            });

            totalAttempts++;
          }
        }
      }
    }

    // ── 6. Summary ─────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────');
    console.log(`🎉 Seeding complete!`);
    console.log(`   📝 Quizzes created   : ${totalQuizzes}`);
    console.log(`   ❓ Questions created : ${totalQuestions}`);
    console.log(`   📊 Attempts seeded   : ${totalAttempts}`);
    console.log('─────────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from DB');
  }
}

seedQuizzes();
