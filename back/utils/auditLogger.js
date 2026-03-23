const AuditLog = require('../models/auditLog.model');

const logAudit = async (req, action, module, details) => {
    try {
        await AuditLog.create({
            userId: req.user._id,
            schoolId: req.user.schoolId,
            action,
            module,
            details,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
    } catch (err) {
        console.error('Audit Logging Failed:', err);
    }
};

module.exports = logAudit;
