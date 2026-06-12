// check_2fa.js - Check and disable 2FA in system settings temporarily
require('dotenv').config();
const mongoose = require('mongoose');

async function check2FA() {
    await mongoose.connect(process.env.MONGODB_PATH);
    console.log('Connected to MongoDB');

    const SystemSetting = require('./models/systemSetting.model');
    
    const settings = await SystemSetting.find({});
    console.log('All system settings:');
    settings.forEach(s => console.log(`  ${s.key}: ${JSON.stringify(s.value)}`));
    
    const twoFa = await SystemSetting.findOne({ key: 'TWO_FACTOR_AUTH' });
    if (twoFa) {
        console.log('\n2FA Setting found:', twoFa.value);
        // Re-enable
        twoFa.value = true;
        await twoFa.save();
        console.log('2FA RE-ENABLED successfully');
    } else {
        console.log('\nNo 2FA setting found - 2FA not enabled');
    }
    
    process.exit(0);
}

check2FA().catch(err => { console.error(err); process.exit(1); });
