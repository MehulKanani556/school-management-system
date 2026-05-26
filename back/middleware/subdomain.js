const SystemSetting = require('../models/systemSetting.model');
const School = require('../models/school.model');

/**
 * When SUBDOMAIN_MAPPING is enabled, resolve school from request host (e.g. greenwood.localhost).
 */
module.exports = async function subdomainResolver(req, res, next) {
    try {
        const setting = await SystemSetting.findOne({ key: 'SUBDOMAIN_MAPPING' });
        const enabled = setting?.value === true || setting?.value === 'true';
        if (!enabled) return next();

        const host = (req.hostname || '').toLowerCase();
        const parts = host.split('.');
        const subdomain = parts[0];
        if (!subdomain || subdomain === 'localhost' || subdomain === 'www' || subdomain === 'api') {
            return next();
        }

        const school = await School.findOne({ subdomain }).select('_id name subdomain');
        if (school) {
            req.tenantSchool = school;
            req.tenantSchoolId = school._id;
        }
        return next();
    } catch (err) {
        return next();
    }
};
