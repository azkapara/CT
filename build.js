// Bakes src/dashboard.html into api/_page.js so the dashboard is never
// deployed as a public static file. Run this after every dashboard edit:
//
//   node build.js
//
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'src', 'dashboard.html');
const target = path.join(__dirname, 'api', '_page.js');

if (!fs.existsSync(source)) {
  console.error('Could not find src/dashboard.html');
  process.exit(1);
}

const html = fs.readFileSync(source, 'utf8');

const out = `// GENERATED FILE - do not edit by hand.
// Source: src/dashboard.html  |  Rebuild with: node build.js
module.exports = { html: ${JSON.stringify(html)} };
`;

fs.writeFileSync(target, out, 'utf8');
console.log(`Embedded ${(html.length / 1024).toFixed(1)} KB into api/_page.js`);
