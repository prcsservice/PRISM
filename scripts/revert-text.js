const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src');

const replacements = {
  'text-bg-primary': 'text-black',
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

    for (const [key, replacement] of Object.entries(replacements)) {
      content = content.split(key).join(replacement);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Reverted ${filePath}`);
    }
  }
});
