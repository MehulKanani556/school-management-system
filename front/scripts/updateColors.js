const fs = require('fs');
const path = require('path');

const ACCENT_COLORS = ['blue', 'indigo', 'cyan', 'sky', 'emerald', 'amber', 'orange', 'violet', 'purple', 'rose', 'fuchsia', 'teal', 'red'];
const STATUS_COLORS = ['emerald', 'red', 'green'];

const ROLE_SETTINGS = [
    { dir: 'src/pages/Accountant', prefix: 'accountant' },
    { dir: 'src/pages/Librarian', prefix: 'librarian' },
    { dir: 'src/pages/Parent', prefix: 'parent' },
    { dir: 'src/pages/schooladmin', prefix: 'schooladmin' },
    { dir: 'src/pages/Student', prefix: 'student' },
    { dir: 'src/pages/superadmin', prefix: 'superadmin' },
    { dir: 'src/pages/teacher', prefix: 'teacher' },
    { dir: 'src/pages/dashboard', prefix: 'brand' } // Generic dashboard
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

            const colorFreq = {};
            // regex matches standard tw color classes
            const regex = /(?:text|bg|border|ring|shadow|from|to|fill|stroke)-(blue|indigo|cyan|sky|teal|emerald|amber|orange|violet|purple|rose|red|fuchsia|yellow)-[3-8]00/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const color = match[1];
                if (!STATUS_COLORS.includes(color)) {
                    colorFreq[color] = (colorFreq[color] || 0) + 1;
                }
            }
            
            let mainColor = null;
            let maxCount = 0;
            for (const c in colorFreq) {
                if (colorFreq[c] > maxCount) {
                    mainColor = c;
                    maxCount = colorFreq[c];
                }
            }
            
            // If the role config mandates a certain color to be main? No, we replace whichever color is main.
            // If we didn't find a prominent non-status color, let's try excluding red only?
            if (!mainColor) {
               // retry with emerald/green just in case it's the main color of the section (like Student)
               const regexFallback = /(?:text|bg|border|ring|shadow|from|to|fill|stroke)-(emerald|green)-[3-8]00/g;
               let matchFb;
               let fallbackCount = 0;
               let fbColor = null;
               while ((matchFb = regexFallback.exec(content)) !== null) {
                   fbColor = matchFb[1];
                   fallbackCount++;
               }
               if (fallbackCount > 5) { // Needs to be clearly the primary
                   mainColor = fbColor;
               }
            }

            if (mainColor) {
                console.log(`[${rolePrefix}] File: ${item} - Replacing primary color (${mainColor}) with ${rolePrefix}-primary`);
                
                // Regex to replace exactly the matched generic color class strings.
                // It replaces things like `bg-amber-600` with `bg-[role]-primary`.
                // Important: It handles opacity modifiers automatically since Tailwind parses `shadow-role-primary/20`.
                const replaceRegex = new RegExp(`(text|bg|border|ring|shadow|from|to|fill|stroke)-${mainColor}-[3-8]00`, 'g');
                
                const newContent = content.replace(replaceRegex, `$1-${rolePrefix}-primary`);
                
                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                }
            }
        }
    }
}

for (const role of ROLE_SETTINGS) {
    const fullDirPath = path.join(process.cwd(), role.dir);
    processDir(fullDirPath, role.prefix);
}

console.log("Color replacement completed.");
