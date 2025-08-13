// scripts/write_ca.js
const fs = require('fs');
const path = require('path');

const pem = process.env.CUSTOM_CA_PEM || process.env.CUSTOM_CA;
if (!pem) {
    console.log('CUSTOM_CA_PEM not set — skipping CA write.');
    process.exit(0);
}

const outdir = path.join(__dirname, '..', '.certs');
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

const out = path.join(outdir, 'ca.pem');
fs.writeFileSync(out, pem + '\n', { encoding: 'utf8', mode: 0o600 });
console.log('Wrote CA to', out);
