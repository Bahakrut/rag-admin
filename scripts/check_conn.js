// scripts/check_conn.js
const { Client } = require('pg');
const url = process.argv[2];
if (!url) { console.error('Usage: node scripts/check_conn.js "<DATABASE_URL>"'); process.exit(1); }
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
c.connect()
    .then(()=> console.log('connected OK'))
    .catch(e => { console.error('ERR', e.message || e); })
    .finally(()=> c.end());
