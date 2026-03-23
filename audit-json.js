const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!dirPath.includes('__tests__') && !dirPath.includes('icons') && !dirPath.includes('shadcn')) {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

function audit() {
  const missing = [];
  walkDir('./src', (filePath) => {
    if (filePath.endsWith('.tsx') && !filePath.endsWith('index.tsx') && !filePath.endsWith('layout.tsx') && !filePath.endsWith('providers.tsx') && !filePath.endsWith('page.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('data-testid')) {
        missing.push(filePath);
      }
    }
  });
  fs.writeFileSync('missing-ids.json', JSON.stringify(missing, null, 2));
}

audit();
