const SystemSetting = require('../models/systemSetting.model');

/**
 * SMS gateway stub. Honors SMS_GATEWAY_ACTIVE when implemented with a real provider.
 */
async function sendSms({ to, message }) {
    const setting = await SystemSetting.findOne({ key: 'SMS_GATEWAY_ACTIVE' });
    if (!setting?.value) {
        return { sent: false, reason: 'SMS_GATEWAY_ACTIVE is disabled' };
    }
    if (process.env.NODE_ENV !== 'production') {
        console.info('[SMS stub]', { to, message: message?.slice(0, 80) });
    }
    return { sent: false, reason: 'SMS provider not configured' };
}

module.exports = { sendSms };
