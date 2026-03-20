const TimetableTemplate = require('../models/timetableTemplate.model');

// Get all templates for a school
exports.getTemplates = async (req, res) => {
    try {
        const schoolId = req.user.schoolId._id || req.user.schoolId;
        const templates = await TimetableTemplate.find({ schoolId });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new template
exports.createTemplate = async (req, res) => {
    try {
        const { name, periods } = req.body;
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        const template = new TimetableTemplate({
            schoolId,
            name,
            periods
        });

        await template.save();
        res.status(201).json(template);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a template
exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, periods } = req.body;

        const template = await TimetableTemplate.findByIdAndUpdate(
            id,
            { name, periods },
            { new: true }
        );

        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json(template);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a template
exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await TimetableTemplate.findByIdAndDelete(id);
        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json({ message: 'Template deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
