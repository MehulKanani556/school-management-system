const mongoose = require('mongoose');
const AuditLog = require('../models/auditLog.model');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const repair = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        
        // Repair Specific CREATE_FEE_STRUCTURE log
        await AuditLog.updateOne(
            { action: 'CREATE_FEE_STRUCTURE', details: 'Created new fee structure for Standard ' },
            { $set: { details: 'Created new fee structure for Standard Grade 2' } }
        );

        // Repair Specific APPLY_FEE_STRUCTURE log
        await AuditLog.updateOne(
            { action: 'APPLY_FEE_STRUCTURE', details: 'Applied fee structure for Standard  for year 2026' },
            { $set: { details: 'Applied fee structure for Standard Grade 2 for Year 2026' } }
        );

        console.log('Sanitization Repair successful.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

repair();
