const SystemSetting = require('../models/systemSetting.model');

let maintenanceMode = false;
let lastCheck = 0;
const CACHE_TTL = 10000; // 10 seconds for more responsiveness during testing

const checkMaintenance = async (req, res, next) => {
    try {
        // 1. ALWAYS allow Super Admin
        if (req.user && req.user.role === 'Super_Admin') {
            return next();
        }

        // 2. ALWAYS allow login/auth related routes so Super Admin can fix the state
        const skipRoutes = ['/login', '/student-login', '/generatenewtoken', '/superadmin/settings', '/superadmin/profile'];
        if (skipRoutes.some(path => req.path.includes(path))) {
            return next();
        }

        // 3. Cache Logic for DB performance
        const now = Date.now();
        if (now - lastCheck > CACHE_TTL) {
            const setting = await SystemSetting.findOne({ key: 'MAINTENANCE_MODE' });
            maintenanceMode = setting ? (setting.value === true || setting.value === 'true') : false;
            lastCheck = now;
        }

        // 4. Block others if Maintenance is active
        if (maintenanceMode) {
            return res.status(503).json({ 
                success: false, 
                message: "CORE INFRASTRUCTURE MAINTENANCE: The platform is currently undergoing scheduled updates. Access is temporarily restricted to Master Level administrators.",
                code: 'MAINTENANCE_ACTIVE'
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance Check Error:', error);
        next(); // Fail open for safety
    }
};

module.exports = checkMaintenance;
