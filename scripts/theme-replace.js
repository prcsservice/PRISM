const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src');

const replacements = {
  'bg-\\[#0A0A0A\\]': 'bg-bg-secondary',
  'border-\\[#1F1F1F\\]': 'border-border-primary',
  'bg-\\[#141414\\]': 'bg-bg-tertiary',
  'bg-\\[#1A1A1A\\]': 'bg-bg-hover',
  'border-\\[#2A2A2A\\]': 'border-border-secondary',
  'hover:border-\\[#333333\\]': 'hover:border-border-hover',
  'hover:border-\\[#6B6B6B\\]': 'hover:border-border-hover',
  'text-white': 'text-text-primary',
  'text-\\[#A0A0A0\\]': 'text-text-secondary',
  'text-\\[#6B6B6B\\]': 'text-text-muted',
  'placeholder:text-\\[#6B6B6B\\]': 'placeholder:text-text-muted',
  'bg-black': 'bg-bg-primary',
  'text-black': 'text-bg-primary', // Often used for inverted text on light backgrounds or accent backgrounds
};

// Also standardizing accent variable
const accentReplacements = {
  'bg-\\[var\\(--accent\\)\\]': 'bg-(--accent)',
  'text-\\[var\\(--accent\\)\\]': 'text-(--accent)',
  'border-\\[var\\(--accent\\)\\]': 'border-(--accent)',
  'focus:border-\\[var\\(--accent\\)\\]': 'focus:border-(--accent)',
  'focus:ring-\\[var\\(--accent\\)\\]': 'focus:ring-(--accent)'
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
    
    for (const [regexStr, replacement] of Object.entries(accentReplacements)) {
      const regex = new RegExp(regexStr, 'g');
      content = content.replace(regex, replacement);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
