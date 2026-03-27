const mongoose = require('mongoose');
const FeeStructure = require('../models/feeStructure.model');
const Standard = require('../models/standard.model');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const listStructures = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        const structures = await FeeStructure.find().populate('standardId');
        structures.forEach(s => {
            console.log(`ID: ${s._id}, Standard: ${s.standardId?.name || `Grade ${s.standardId?.level}`}, Created: ${s.createdAt}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listStructures();
