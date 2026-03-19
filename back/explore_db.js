const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user.model');
const School = require('./models/school.model');

async function explore() {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to DB');

    const schools = await School.find();
    console.log('Schools:', schools);

    const admins = await User.find({ role: 'School_Admin' });
    console.log('School Admins:', admins);

    await mongoose.disconnect();
}

explore();
