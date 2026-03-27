const mongoose = require('mongoose');
const AuditLog = require('../models/auditLog.model');
const Student = require('../models/student.model');
const Standard = require('../models/standard.model');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const sanitize = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to DB for sanitization...');

        const logs = await AuditLog.find({ details: { $regex: /[0-9a-fA-F]{24}/ } });
        console.log(`Found ${logs.length} logs with potential IDs.`);

        for (const log of logs) {
            let updatedDetails = log.details;
            
            // Extract all IDs
            const ids = log.details.match(/[0-9a-fA-F]{24}/g);
            if (!ids) continue;

            for (const id of ids) {
                // Try to find a Student
                const student = await Student.findById(id);
                if (student) {
                    const name = `${student.firstName} ${student.lastName}`;
                    updatedDetails = updatedDetails.replace(id, name);
                    continue;
                }

                // Try to find a Standard
                const standard = await Standard.findById(id);
                if (standard) {
                    const label = standard.name || `Grade ${standard.level}`;
                    updatedDetails = updatedDetails.replace(id, label);
                    continue;
                }
            }

            // Also fix the $ sign if present
            updatedDetails = updatedDetails.replace(/\$/g, '₹');

            if (updatedDetails !== log.details) {
                log.details = updatedDetails;
                await log.save();
                console.log(`Updated log: ${log.action}`);
            }
        }

        console.log('Sanitization complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

sanitize();
