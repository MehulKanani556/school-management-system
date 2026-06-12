const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.MONGODB_PATH || 'mongodb://localhost:27017/school';
const backupFile = process.argv[2];

if (!backupFile) {
    console.log("=========================================================================");
    console.log("Database Restore Protocol - Help Guide");
    console.log("=========================================================================");
    console.log("Please specify the backup JSON file path to execute database recovery.");
    console.log("\nUsage:");
    console.log("  node restore_db.js <path-to-downloaded-backup.json>");
    console.log("\nExample:");
    console.log("  node restore_db.js uploads/backups/backup-6a2ba95bdac81065bb008147.json");
    console.log("=========================================================================");
    process.exit(1);
}

async function run() {
    console.log("Connecting to Database Vector...");
    await mongoose.connect(dbPath);
    console.log("Connection Established successfully.");

    // Resolve models directory
    const modelsDir = path.join(__dirname, 'models');
    console.log("Registering Database Schemas...");
    fs.readdirSync(modelsDir).forEach(file => {
        if (file.endsWith('.js')) {
            require(path.join(modelsDir, file));
        }
    });
    console.log(`Registered ${Object.keys(mongoose.models).length} schemas.`);

    console.log("Parsing backup snapshot archive payload...");
    const snapshotPath = path.resolve(backupFile);
    if (!fs.existsSync(snapshotPath)) {
        console.error(`Error: Backup file not found at path: ${snapshotPath}`);
        process.exit(1);
    }
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    console.log(`Snapshot Target Type: ${snapshot.type}`);
    console.log(`Snapshot Exported At: ${snapshot.exportedAt}`);

    const data = snapshot.data;
    if (!data) {
        console.error("Error: Snapshot does not contain a valid collection data payload.");
        process.exit(1);
    }

    console.log("\nExecuting Purge-and-Restore operations...");
    for (const modelName of Object.keys(data)) {
        if (!mongoose.models[modelName]) {
            console.log(`[SKIP] Schema not registered in code context: ${modelName}`);
            continue;
        }
        
        const Model = mongoose.models[modelName];
        const documents = data[modelName];
        
        console.log(`[PURGE] Clearing existing documents for ${modelName}...`);
        await Model.deleteMany({});
        
        if (documents && documents.length > 0) {
            console.log(`[RESTORE] Injecting ${documents.length} records into ${modelName}...`);
            await Model.insertMany(documents);
        } else {
            console.log(`[RESTORE] No records found for ${modelName}.`);
        }
    }

    console.log("\n=========================================================================");
    console.log("Platform Database Restoration Protocol Completed Successfully!");
    console.log("=========================================================================");
    mongoose.connection.close();
}

run().catch(err => {
    console.error("\n[CRITICAL FAILURE] Database restore aborted:", err);
    mongoose.connection.close();
    process.exit(1);
});
