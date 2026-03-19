const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
    await mongoose.connect(process.env.MONGODB_PATH);
    const collection = mongoose.connection.collection('classsections');
    try {
        await collection.dropIndex('schoolId_1_gradeLevel_1_sectionLabel_1');
        console.log('Successfully dropped index: schoolId_1_gradeLevel_1_sectionLabel_1');
    } catch (e) {
        console.error('Error or already dropped:', e.message);
    }
    await mongoose.disconnect();
}

dropIndex();
