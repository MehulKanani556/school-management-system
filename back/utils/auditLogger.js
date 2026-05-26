const AuditLog = require('../models/auditLog.model');
const SystemSetting = require('../models/systemSetting.model');

const logAudit = async (req, action, module, details) => {
    try {
        const setting = await SystemSetting.findOne({ key: 'AUDIT_LOGGING_LEVEL' });
        const enabled = setting ? setting.value === true || setting.value === 'true' : true;
        if (!enabled) return;

        await AuditLog.create({
            userId: req.user?._id,
            schoolId: req.user?.schoolId,
            action,
            module,
            details,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Audit Logging Failed:', err.message);
        }
    }
};

module.exports = logAudit;
