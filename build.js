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
  // On Vercel, src/ is excluded on purpose (see .vercelignore) and api/_page.js
  // is already committed, so there is nothing to do here.
  if (fs.existsSync(target)) {
    console.log('No src/dashboard.html here — api/_page.js is already built. Skipping.');
    process.exit(0);
  }
  console.error('Could not find src/dashboard.html, and api/_page.js does not exist yet.');
  process.exit(1);
}

const html = fs.readFileSync(source, 'utf8');

const out = `// GENERATED FILE - do not edit by hand.
// Source: src/dashboard.html  |  Rebuild with: node build.js
module.exports = { html: ${JSON.stringify(html)} };
`;

fs.writeFileSync(target, out, 'utf8');
console.log(`Embedded ${(html.length / 1024).toFixed(1)} KB into api/_page.js`);
