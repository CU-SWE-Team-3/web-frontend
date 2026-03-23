const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function audit() {
  const missing = [];
  walkDir('./src', (filePath) => {
    if (filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('data-testid')) {
        missing.push(filePath);
      }
    }
  });
  console.log('--- MISSING TEST IDS ---');
  missing.forEach(f => console.log(f));
  console.log('--- COUNT: ' + missing.length + ' ---');
}

audit();
