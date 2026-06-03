const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'frontend', '.env');
const env = fs.readFileSync(envPath, 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();

fetch(url + '/auth/v1/settings', { headers: { apikey: key } })
  .then(r => r.json())
  .then(s => console.log(JSON.stringify(s, null, 2)))
  .catch(e => console.error(e.message));
