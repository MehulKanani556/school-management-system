const AcademicYear = require('../models/academicYear.model');
const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
  const headerId = req.headers['x-academic-year-id'];
  const queryId = req.query.academicYearId;
  const ayId = headerId || queryId;

  try {
    // Normalize schoolId — for Students it may be a populated School object
    const rawSchoolId = req.user?.schoolId;
    const resolvedSchoolId = (rawSchoolId && typeof rawSchoolId === 'object' && rawSchoolId._id)
      ? rawSchoolId._id
      : rawSchoolId;
    const schoolId = resolvedSchoolId
      ? new mongoose.Types.ObjectId(resolvedSchoolId)
      : null;

    if (ayId) {
      if (!mongoose.Types.ObjectId.isValid(ayId)) {
        return res.status(400).json({ message: 'Invalid academic year ID format' });
      }

      const filter = { _id: new mongoose.Types.ObjectId(ayId) };
      if (schoolId) filter.schoolId = schoolId;

      const academicYear = await AcademicYear.findOne(filter).select('_id name');

      if (!academicYear) {
        return res.status(400).json({
          message: 'Invalid or expired academic session. Please refresh the page and select a session again.',
          code: 'INVALID_ACADEMIC_YEAR',
        });
      }

      req.academicYearId = academicYear._id;
      req.academicYearName = academicYear.name;
      return next();
    }

    if (schoolId) {
      const current = await AcademicYear.findOne({ schoolId, isCurrent: true }).select('_id name');
      if (current) {
        req.academicYearId = current._id;
        req.academicYearName = current.name;
        return next();
      }

      const mostRecent = await AcademicYear.findOne({ schoolId }).sort({ startDate: -1 }).select('_id name');
      if (mostRecent) {
        req.academicYearId = mostRecent._id;
        req.academicYearName = mostRecent.name;
        return next();
      }
    }

    req.academicYearId = null;
    req.academicYearName = null;
    next();
  } catch (err) {
    console.error('Academic Year Middleware Error:', err);
    return res.status(500).json({ message: 'Error resolving academic year' });
  }
};
