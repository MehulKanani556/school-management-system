const AcademicYear = require('../models/academicYear.model');
const mongoose = require('mongoose');

module.exports = async (req, res, next) => {
  const ayId = req.headers['x-academic-year-id'];
  
  try {
    if (ayId) {
      // Validate the provided academic year ID
      if (!mongoose.Types.ObjectId.isValid(ayId)) {
        return res.status(400).json({ message: 'Invalid Academic Year ID format' });
      }

      const academicYear = await AcademicYear.findOne({ 
        _id: ayId, 
        schoolId: req.user?.schoolId 
      }).select('_id');

      if (!academicYear) {
        return res.status(404).json({ message: 'Academic Year not found or does not belong to your school' });
      }

      req.academicYearId = new mongoose.Types.ObjectId(ayId);
      return next();
    }

    // Fallback: resolve the current active year for the school
    if (req.user?.schoolId) {
      const current = await AcademicYear.findOne({ 
        schoolId: req.user.schoolId, 
        isCurrent: true 
      }).select('_id');
      
      if (current) {
        req.academicYearId = current._id;
        return next();
      }
      
      // If no current year, try to get the most recent one
      const mostRecent = await AcademicYear.findOne({ 
        schoolId: req.user.schoolId 
      }).sort({ startDate: -1 }).select('_id');
      
      if (mostRecent) {
        req.academicYearId = mostRecent._id;
        console.warn(`No current academic year set for school ${req.user.schoolId}. Using most recent: ${mostRecent._id}`);
        return next();
      }
    }

    // No academic year found - log warning but continue
    // The controller will handle the missing academic year appropriately
    console.warn('No academic year found for request:', req.path);
    req.academicYearId = null;
    next();
  } catch (err) {
    console.error('Academic Year Middleware Error:', err);
    return res.status(500).json({ message: 'Error resolving academic year' });
  }
};
