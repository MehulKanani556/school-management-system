const mongoose = require('mongoose');
require('dotenv').config();

async function checkIndexes() {
    await mongoose.connect(process.env.MONGODB_PATH);
    const collection = mongoose.connection.collection('classsections');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    await mongoose.disconnect();
}

checkIndexes();
