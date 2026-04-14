const mongoose = require('mongoose');

/**
 * Add academic year filter to query object
 * @param {Object} query - The base query object
 * @param {String|ObjectId} academicYearId - The academic year ID from req.academicYearId
 * @returns {Object} - Query object with academicYearId filter added
 */
const addAcademicYearFilter = (query, academicYearId) => {
  if (!academicYearId) {
    console.warn('Academic Year ID not provided for filtering');
    return query;
  }

  return {
    ...query,
    academicYearId: mongoose.Types.ObjectId.isValid(academicYearId) 
      ? new mongoose.Types.ObjectId(academicYearId)
      : academicYearId
  };
};

/**
 * Get academic year filter for aggregation pipelines
 * @param {String|ObjectId} academicYearId - The academic year ID
 * @returns {Object} - Match stage for aggregation
 */
const getAcademicYearMatch = (academicYearId) => {
  if (!academicYearId) return {};
  
  return {
    academicYearId: mongoose.Types.ObjectId.isValid(academicYearId)
      ? new mongoose.Types.ObjectId(academicYearId)
      : academicYearId
  };
};

/**
 * Validate if a model should be filtered by academic year
 * Models that should be filtered: Attendance, Assignment, Exam, FeePayment, 
 * FeeStructure, Mark, StudentEnrollment, Timetable, Quiz, QuizAttempt
 */
const YEAR_SENSITIVE_MODELS = [
  'Attendance',
  'Assignment', 
  'Exam',
  'FeePayment',
  'FeeStructure',
  'Mark',
  'StudentEnrollment',
  'Timetable',
  'Quiz',
  'QuizAttempt',
  'LessonPlan',
  'BehaviorLog',
  'Submission'
];

const isYearSensitiveModel = (modelName) => {
  return YEAR_SENSITIVE_MODELS.includes(modelName);
};

module.exports = {
  addAcademicYearFilter,
  getAcademicYearMatch,
  isYearSensitiveModel,
  YEAR_SENSITIVE_MODELS
};
