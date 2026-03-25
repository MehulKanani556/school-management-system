const fs = require('fs');
const path = require('path');

const ACCENT_COLORS = ['blue', 'indigo', 'cyan', 'sky', 'amber', 'violet', 'purple', 'fuchsia'];

const ROLE_SETTINGS = [
    { dir: 'src/pages/Accountant', prefix: 'accountant' },
    { dir: 'src/pages/Librarian', prefix: 'librarian' },
    { dir: 'src/pages/Parent', prefix: 'parent' },
    { dir: 'src/pages/schooladmin', prefix: 'schooladmin' },
    { dir: 'src/pages/Student', prefix: 'student' },
    { dir: 'src/pages/SuperAdmin', prefix: 'superadmin' },  // SuperAdmin might not exist
    { dir: 'src/pages/teacher', prefix: 'teacher' }
];

function processDir(dirPath, rolePrefix) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath, rolePrefix);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Simple heuristic to replace the most common accent colors...
            // EXCEPT for things that are logically related to status like emerald, red, rose (for delete/error)
            // Or explicitly named status styles (we need to be careful).
            // Usually, primary accent colors are in classes like text-[color]-[456]00 or bg-[color]-[456]00.
            // But sometimes the user used 'rose' as primary for Parent or MemberRegistry?
            // Actually, in previous edits, the user replaced text-emerald-500, text-orange-500, text-blue-500 with transporter-primary without discrimination except for 'status' cases.
            
            // Replaces text-blue-500, bg-amber-600/10 with text-prefix-primary, bg-prefix-primary/10
            
            // To be safe, we will specifically target the main color used in that file.
            const colorFreq = {};
            const regex = /(?:text|bg|border|ring|shadow|from|to|fill|stroke)-(blue|indigo|cyan|sky|teal|emerald|amber|orange|violet|purple|rose|red|fuchsia|yellow)-[345678]00/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const color = match[1];
                if (!['red', 'emerald', 'green'].includes(color)) {  // exclude common status colors
                    colorFreq[color] = (colorFreq[color] || 0) + 1;
                }
            }
            
            // Get the most frequent generic color in this file
            let mainColor = null;
            let maxCount = 0;
            for (const c in colorFreq) {
                if (colorFreq[c] > maxCount) {
                    mainColor = c;
                    maxCount = colorFreq[c];
                }
            }
            
            // If we found a main color that appears frequently enough (e.g. > 2 times)
            if (mainColor && maxCount > 0) {
                console.log(`File: ${fullPath} - Replacing ${mainColor} with ${rolePrefix}-primary (${maxCount} occurrences)`);
                
                // Replace all occurrences of that main color
                const replaceRegex = new RegExp(`(text|bg|border|ring|shadow|from|to|fill|stroke)-${mainColor}-[345678]00`, 'g');
                content = content.replace(replaceRegex, `$1-${rolePrefix}-primary`);
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

for (const role of ROLE_SETTINGS) {
    const fullDirPath = path.join(process.cwd(), role.dir);
    processDir(fullDirPath, role.prefix);
}

// Optionally process Dashboard/Home component? 
// User mentioned 'dashboard' maybe src/components/Dashboard?
const otherDirs = ['src/components'];
for(const dir of otherDirs) {
    // Only target files containing Dashboard?
    if(!fs.existsSync(path.join(process.cwd(), dir))) continue;
    // skip for now since dashboards are likely inside role directories
}

