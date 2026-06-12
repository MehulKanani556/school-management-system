const mongoose = require('mongoose');
require('dotenv').config();

const Ticket = require('./models/ticket.model');
const User = require('./models/user.model');
const School = require('./models/school.model');

async function run() {
    const dbPath = process.env.MONGODB_PATH || 'mongodb://localhost:27017/school';
    await mongoose.connect(dbPath);
    console.log("Connected.");

    const tickets = await Ticket.find().populate('openedBy', 'firstName lastName role').populate('schoolId', 'name').lean();
    console.log("Tickets in database:", JSON.stringify(tickets, null, 2));

    mongoose.connection.close();
}

run().catch(err => {
    console.error(err);
    mongoose.connection.close();
});
