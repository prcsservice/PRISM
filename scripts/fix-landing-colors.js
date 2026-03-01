const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'components', 'landing');

const replacements = {
  'bg-white': 'bg-bg-primary',
  'bg-\\[#F5F5F0\\]': 'bg-bg-secondary',
  'border-\\[#E5E5E5\\]': 'border-border-primary',
};

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(dir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regexStr, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(regexStr, 'g');
      content = content.replace(regex, replacement);
    }
    
    // Fix any text-black that should be text-text-primary because we changed the background from locked-white to dynamic theme background
    // If the background is dynamic, text should also be dynamic
    content = content.replace(/text-black/g, 'text-text-primary');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
