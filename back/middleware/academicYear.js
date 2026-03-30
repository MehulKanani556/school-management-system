const AcademicYear = require('../models/academicYear.model');

module.exports = async (req, res, next) => {
  const ayId = req.headers['x-academic-year-id'];
  if (ayId) {
    req.academicYearId = ayId;
    return next();
  }
  // Fallback: resolve the current active year for the school
  try {
    if (req.user?.schoolId) {
      const current = await AcademicYear.findOne({ schoolId: req.user.schoolId, isCurrent: true }).select('_id');
      if (current) req.academicYearId = current._id.toString();
    }
  } catch (_) { /* non-fatal, continue without */ }
  next();
};
