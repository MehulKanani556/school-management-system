const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function dropIndex() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected.');
        
        const collection = mongoose.connection.collection('feestructures');
        const indexes = await collection.listIndexes().toArray();
        console.log('Existing indexes:', JSON.stringify(indexes, null, 2));

        const target = 'schoolId_1_gradeLevel_1_academicYear_1';
        if (indexes.find(idx => idx.name === target)) {
            await collection.dropIndex(target);
            console.log(`Successfully dropped index: ${target}`);
        } else {
            console.log(`Index ${target} not found.`);
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

dropIndex();
