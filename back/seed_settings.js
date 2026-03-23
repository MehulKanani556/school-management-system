const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const SystemSetting = require('./models/systemSetting.model');

const defaults = [
    { key: 'MAINTENANCE_MODE', value: false, description: 'Disable all site features temporarily.' },
    { key: 'GLOBAL_REGISTRATION', value: true, description: 'Allow new schools to register independently.' },
    { key: 'SUBDOMAIN_MAPPING', value: false, description: 'Route site nodes based on institutional identifiers.' },
    { key: 'TWO_FACTOR_AUTH', value: false, description: 'Enforce MFA across all administrative sessions.' },
    { key: 'AUTO_LOCK_ACCOUNTS', value: true, description: 'Lock accounts after multiple failed login attempts.' },
    { key: 'AUDIT_LOGGING_LEVEL', value: true, description: 'Maintain maximum forensic detail in event logs.' },
    { key: 'EMAIL_NOTIFICATIONS', value: true, description: 'Master switch for all platform-generated emails.' },
    { key: 'SMS_GATEWAY_ACTIVE', value: false, description: 'Enable SMS-based alerts and notifications.' },
    { key: 'SYSTEM_ANNOUNCEMENTS', value: true, description: 'Global announcements visible to all node users.' }
];

async function seedSettings() {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to DB');

        for (const def of defaults) {
            const exists = await SystemSetting.findOne({ key: def.key });
            if (!exists) {
                await SystemSetting.create(def);
                console.log(`Seeded default: ${def.key}`);
            }
        }
        
        const all = await SystemSetting.find();
        console.log('Current System Settings:', all);

        await mongoose.disconnect();
        console.log('Disconnected from DB');
    } catch (error) {
        console.error('Error:', error);
    }
}

seedSettings();
