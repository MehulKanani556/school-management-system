const Holiday = require('../models/holiday.model');

// Helper to get schoolId for School Admin
const getSchoolId = (user) => user.schoolId; // I'll check how schoolId is stored on the user object.

exports.createHoliday = async (req, res) => {
  try {
    const { title, startDate, endDate, description } = req.body;
    const holiday = await Holiday.create({
      schoolId: req.user.schoolId,
      title, startDate, endDate, description
    });
    res.status(201).json(holiday);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getHolidays = async (req, res) => {
  try {
    const query = req.user.role === 'Super_Admin' ? {} : { schoolId: req.user.schoolId };
    const holidays = await Holiday.find(query).sort({ startDate: 1 });
    res.json(holidays);
  } catch (err) { res.status(500).json({ message: err.message }); }
};


exports.updateHoliday = async (req, res) => {
  try {
    const { title, startDate, endDate, description } = req.body;
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { title, startDate, endDate, description },
      { new: true }
    );
    res.json(holiday);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteHoliday = async (req, res) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ message: 'Holiday deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
