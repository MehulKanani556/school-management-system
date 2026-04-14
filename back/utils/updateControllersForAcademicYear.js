/**
 * This file documents all the changes needed for academic year filtering
 * Apply these changes manually or use this as a reference
 */

const CONTROLLER_UPDATES = {
  'student.controller.js': {
    imports: `const { addAcademicYearFilter } = require('../utils/academicYearHelper');`,
    
    updates: [
      {
        function: 'getAttendance',
        change: 'Add academicYearId filter to Attendance.find query',
        before: `const filter = { classSection: student.classSection._id, 'records.studentId': student._id };`,
        after: `const filter = addAcademicYearFilter({ classSection: student.classSection._id, 'records.studentId': student._id }, req.academicYearId);`
      },
      {
        function: 'getResults',
        change: 'Add academicYearId filter to Mark.find query',
        before: `const marks = await Mark.find({ studentId: student._id })`,
        after: `const marks = await Mark.find(addAcademicYearFilter({ studentId: student._id }, req.academicYearId))`
      },
      {
        function: 'getAssignments',
        change: 'Add academicYearId filter to Assignment.find query',
        before: `const assignments = await Assignment.find({ classSection: student.classSection._id })`,
        after: `const assignments = await Assignment.find(addAcademicYearFilter({ classSection: student.classSection._id }, req.academicYearId))`
      },
      {
        function: 'submitAssignment',
        change: 'Add academicYearId when creating Submission',
        before: `{ schoolId: student.schoolId._id, assignmentId, studentId: student._id, fileUrl, comments, submittedAt: new Date(), status: 'Submitted' }`,
        after: `{ schoolId: student.schoolId._id, assignmentId, studentId: student._id, academicYearId: req.academicYearId, fileUrl, comments, submittedAt: new Date(), status: 'Submitted' }`
      },
      {
        function: 'getMySubmissions',
        change: 'Add academicYearId filter to Submission.find query',
        before: `const submissions = await Submission.find({ studentId: student._id })`,
        after: `const submissions = await Submission.find(addAcademicYearFilter({ studentId: student._id }, req.academicYearId))`
      },
      {
        function: 'getFees',
        change: 'Add academicYearId filter to FeePayment.find query',
        before: `const fees = await FeePayment.find({ studentId: student._id })`,
        after: `const fees = await FeePayment.find(addAcademicYearFilter({ studentId: student._id }, req.academicYearId))`
      },
      {
        function: 'getExams',
        change: 'Add academicYearId filter to Exam.find query',
        before: `const exams = await Exam.find({ standardId: student.standard, schoolId: student.schoolId._id, isPublished: true, $or: [{ classSection: student.classSection._id }, { classSection: null }] })`,
        after: `const exams = await Exam.find(addAcademicYearFilter({ standardId: student.standard, schoolId: student.schoolId._id, isPublished: true, $or: [{ classSection: student.classSection._id }, { classSection: null }] }, req.academicYearId))`
      },
      {
        function: 'downloadReportCard',
        change: 'Add academicYearId filter to Mark.find query',
        before: `const marks = await Mark.find({ studentId: id, schoolId })`,
        after: `const marks = await Mark.find(addAcademicYearFilter({ studentId: id, schoolId }, req.academicYearId))`
      },
      {
        function: 'getQuizzes',
        change: 'Add academicYearId filter to Quiz.find query',
        before: `const quizzes = await Quiz.find({ schoolId: student.schoolId._id, standardId: student.standard, isPublished: true })`,
        after: `const quizzes = await Quiz.find(addAcademicYearFilter({ schoolId: student.schoolId._id, standardId: student.standard, isPublished: true }, req.academicYearId))`
      },
      {
        function: 'submitQuiz',
        change: 'Add academicYearId when creating QuizAttempt',
        before: `let attempt = await QuizAttempt.create({ quizId, studentId: student._id, schoolId: student.schoolId._id, answers: results, score, totalPoints, status });`,
        after: `let attempt = await QuizAttempt.create({ quizId, studentId: student._id, schoolId: student.schoolId._id, academicYearId: req.academicYearId, answers: results, score, totalPoints, status });`
      },
      {
        function: 'getQuizHistory',
        change: 'Add academicYearId filter to QuizAttempt.find query',
        before: `const attempts = await QuizAttempt.find({ studentId: student._id })`,
        after: `const attempts = await QuizAttempt.find(addAcademicYearFilter({ studentId: student._id }, req.academicYearId))`
      }
    ]
  },
  
  'teacher.controller.js': {
    imports: `const { addAcademicYearFilter } = require('../utils/academicYearHelper');`,
    
    updates: [
      {
        function: 'getTeacherDashboard',
        change: 'Add academicYearId filters to all queries',
        note: 'Update Assignment, Attendance, and other year-sensitive queries'
      },
      {
        function: 'markAttendance',
        change: 'Already has academicYearId - verify it is used correctly'
      },
      {
        function: 'addMarks',
        change: 'Already has academicYearId - verify it is used correctly'
      },
      {
        function: 'uploadAssignment',
        change: 'Already has academicYearId - verify it is used correctly'
      },
      {
        function: 'getAssignments',
        change: 'Add academicYearId filter to Assignment.find query',
        before: `const assignments = await Assignment.find({ createdBy: req.user._id })`,
        after: `const assignments = await Assignment.find(addAcademicYearFilter({ createdBy: req.user._id }, req.academicYearId))`
      },
      {
        function: 'createQuiz',
        change: 'Add academicYearId when creating Quiz',
        note: 'Ensure academicYearId is included in quiz creation'
      },
      {
        function: 'getMyQuizzes',
        change: 'Add academicYearId filter to Quiz.find query'
      },
      {
        function: 'createLessonPlan',
        change: 'Add academicYearId when creating LessonPlan'
      },
      {
        function: 'getLessonPlans',
        change: 'Add academicYearId filter to LessonPlan.find query'
      },
      {
        function: 'logBehavior',
        change: 'Add academicYearId when creating BehaviorLog'
      },
      {
        function: 'getBehaviorLogs',
        change: 'Add academicYearId filter to BehaviorLog.find query'
      }
    ]
  },
  
  'schoolAdmin.controller.js': {
    imports: `const { addAcademicYearFilter, getAcademicYearMatch } = require('../utils/academicYearHelper');`,
    
    updates: [
      {
        function: 'getDashboardStats',
        change: 'Add academicYearId filters to all year-sensitive queries',
        note: 'Already has some filters, ensure all are consistent'
      },
      {
        function: 'getStudents',
        change: 'Filter by current academic year enrollment',
        note: 'Join with StudentEnrollment to get current year students'
      },
      {
        function: 'getAttendance',
        change: 'Add academicYearId filter'
      },
      {
        function: 'saveAttendance',
        change: 'Already has academicYearId - verify'
      },
      {
        function: 'getExams',
        change: 'Add academicYearId filter'
      },
      {
        function: 'createExam',
        change: 'Add academicYearId when creating'
      },
      {
        function: 'getFees',
        change: 'Add academicYearId filter'
      },
      {
        function: 'getAllAssignments',
        change: 'Add academicYearId filter'
      }
    ]
  }
};

module.exports = CONTROLLER_UPDATES;
