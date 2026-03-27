const mongoose = require('mongoose');
const AuditLog = require('../models/auditLog.model');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        const logs = await AuditLog.find({ action: { $in: ['APPLY_FEE_STRUCTURE', 'CREATE_FEE_STRUCTURE'] } });
        logs.forEach(l => console.log(`${l.action}: ${l.details}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
