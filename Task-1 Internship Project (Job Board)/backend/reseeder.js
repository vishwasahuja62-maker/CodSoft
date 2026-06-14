const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { dbRaw, dbGet } = require('./services/supabase');
const { initDatabase } = require('./database');

async function reseed() {
  try {
    console.log('Truncating tables...');
    await dbRaw('TRUNCATE TABLE applications CASCADE');
    await dbRaw('TRUNCATE TABLE jobs CASCADE');
    await dbRaw('TRUNCATE TABLE profiles CASCADE');
    await dbRaw('TRUNCATE TABLE users CASCADE');
    console.log('Tables truncated.');

    console.log('Re-seeding...');
    await initDatabase();
    console.log('Re-seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Re-seed error:', err.message);
    process.exit(1);
  }
}
reseed();
