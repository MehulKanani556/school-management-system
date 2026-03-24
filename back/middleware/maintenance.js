const SystemSetting = require('../models/systemSetting.model');
const jwt = require('jsonwebtoken');

let maintenanceMode = false;
let lastCheck = 0;
const CACHE_TTL = 10000; // 10 seconds

const checkMaintenance = async (req, res, next) => {
    try {
        // 1. Skip check for these routes
        const skipRoutes = ['/login', '/student-login', '/forgot-password', '/verify', '/change-password', '/superadmin/settings', '/superadmin/profile'];
        if (skipRoutes.some(path => req.path.includes(path))) {
            return next();
        }

        // 2. Identify Super Admin by token if req.user is not yet populated
        let isSuperAdmin = false;
        if (req.user && req.user.role === 'Super_Admin') {
            isSuperAdmin = true;
        } else {
            const authHeader = req.header("Authorization");
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                if (token) {
                    try {
                        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                        if (decoded && decoded.role === 'Super_Admin') {
                            isSuperAdmin = true;
                        }
                    } catch (e) {
                        // Ignore token errors here, they'll be handled by the main auth middleware later
                    }
                }
            }
        }

        if (isSuperAdmin) return next();

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
                message: "CORE INFRASTRUCTURE MAINTENANCE: Platform access is temporarily restricted to Master Level administrators.",
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
