const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { fakerEN_IN: faker } = require('@faker-js/faker');
require('dotenv').config();

async function runSmartSeeder() {
    try {
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to DB');

        // Load all models
        const modelsPath = path.join(__dirname, 'models');
        const files = fs.readdirSync(modelsPath).filter(f => f.endsWith('.model.js'));
        for (const file of files) {
            require(path.join(modelsPath, file));
        }

        const models = mongoose.models;
        const modelNames = Object.keys(models);
        console.log(`Loaded ${modelNames.length} models.`);

        // Step 1: Ensure School exists
        const School = models['School'];
        let school = await School.findOne();
        if (!school) {
            school = await School.create({
                name: 'Delhi Public School',
                address: 'New Delhi, India',
                contactNumber: '0112345678',
                email: 'info@dps.edu',
                adminEmail: 'admin@dps.edu',
                subdomain: 'dps-delhi'
            });
        }
        
        // Dictionary to store inserted doc IDs for references
        const refPool = {
            'School': [school._id]
        };

        // For storing model dependencies (poor man's topological sort via multiple passes)
        // Or we can just do 3 passes and if a ref is missing, skip and retry.

        const coreModels = ['School', 'AcademicYear', 'SystemSetting', 'Subject', 'Teacher', 'Standard', 'FeeStructure', 'Exam', 'ClassSection', 'Student', 'Announcement', 'User'];
        
        // Populate refPool with all core models so we can link to them
        for (const name of coreModels) {
            if (models[name]) {
                const docs = await models[name].find().select('_id');
                refPool[name] = docs.map(d => d._id);
            }
        }

        console.log('Starting data generation for all other collections...');

        for (let pass = 1; pass <= 3; pass++) {
            console.log(`\n--- Pass ${pass} ---`);
            for (const name of modelNames) {
                if (coreModels.includes(name)) continue; // Handled by seed_all_real_data.js
                
                const Model = models[name];
                
                if (pass === 1) {
                    await Model.deleteMany({}); // Drop old data on first pass
                }

                const schema = Model.schema;
                const paths = schema.paths;
                
                if (!refPool[name]) refPool[name] = [];

                const hasAcademicYear = !!paths['academicYearId'];
                const academicYearsToUse = hasAcademicYear && refPool['AcademicYear'] ? refPool['AcademicYear'] : [null];

                for (const acYearId of academicYearsToUse) {
                    console.log(`Generating data for ${name} (AcademicYear: ${acYearId || 'None'})...`);
                    for (let i = 0; i < 5; i++) {
                        const docObj = {};
                        let canCreate = true;

                        for (const [pathName, pathType] of Object.entries(paths)) {
                            if (pathName === '_id' || pathName === '__v' || pathName === 'createdAt' || pathName === 'updatedAt') continue;
                            
                            const instance = pathType.instance;
                            const options = pathType.options;
                            const isRequired = options.required;
                            
                            if (pathName === 'academicYearId' && acYearId) {
                                docObj[pathName] = acYearId;
                            } else if (instance === 'ObjectID') {
                                const ref = options.ref;
                                if (ref && refPool[ref] && refPool[ref].length > 0) {
                                    docObj[pathName] = faker.helpers.arrayElement(refPool[ref]);
                                } else if (pathName === 'schoolId' && refPool['School']) {
                                    docObj[pathName] = refPool['School'][0];
                                } else if (isRequired) {
                                    canCreate = false;
                                    break;
                                }
                            } else if (instance === 'String') {
                                if (options.enum && options.enum.length > 0) {
                                    docObj[pathName] = faker.helpers.arrayElement(options.enum);
                                } else if (pathName.toLowerCase().includes('email')) {
                                    docObj[pathName] = faker.internet.email().toLowerCase();
                                } else if (pathName.toLowerCase().includes('name') || pathName.toLowerCase().includes('title')) {
                                    docObj[pathName] = faker.person.fullName();
                                } else if (pathName.toLowerCase().includes('phone') || pathName.toLowerCase().includes('contact')) {
                                    docObj[pathName] = faker.string.numeric(10);
                                } else if (pathName.toLowerCase().includes('password')) {
                                    docObj[pathName] = 'password123';
                                } else {
                                    docObj[pathName] = faker.lorem.word();
                                }
                            } else if (instance === 'Number') {
                                docObj[pathName] = faker.number.int({ min: 1, max: 1000 });
                            } else if (instance === 'Date') {
                                docObj[pathName] = faker.date.recent();
                            } else if (instance === 'Boolean') {
                                docObj[pathName] = faker.datatype.boolean();
                            } else if (instance === 'Array') {
                                docObj[pathName] = [];
                            } else if (instance === 'Mixed') {
                                docObj[pathName] = { dummy: 'data' };
                            }
                        }

                        if (canCreate) {
                            try {
                                const doc = new Model(docObj);
                                await doc.save({ validateBeforeSave: false });
                                refPool[name].push(doc._id);
                            } catch (err) {
                            }
                        }
                    }
                }
            }
        }

        console.log('\nData population complete for all collections!');
        
        // Final count report
        for (const name of modelNames) {
            const count = await models[name].countDocuments();
            console.log(`${name}: ${count} documents`);
        }

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runSmartSeeder();
