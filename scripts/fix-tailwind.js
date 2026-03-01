const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) {
            processDir(fullPath);
        } else if (dirent.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            content = content.replace(/bg-\[var\(--bg-primary\)\]/g, 'bg-bg-primary');
            content = content.replace(/bg-\[var\(--accent\)\]\/10/g, 'bg-(--accent)/10');
            content = content.replace(/bg-\[var\(--accent\)\]/g, 'bg-(--accent)');
            content = content.replace(/border-\[var\(--accent\)\]/g, 'border-(--accent)');
            content = content.replace(/text-\[var\(--text-dark\)\]/g, 'text-text-dark');
            content = content.replace(/text-\[var\(--accent\)\]/g, 'text-(--accent)');
            content = content.replace(/focus:border-\[var\(--accent\)\]/g, 'focus:border-(--accent)');
            content = content.replace(/z-\[100\]/g, 'z-100');
            content = content.replace(/focus:ring-\[var\(--accent\)\]/g, 'focus:ring-(--accent)');
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    });
}
processDir('d:/prcsm/src');
