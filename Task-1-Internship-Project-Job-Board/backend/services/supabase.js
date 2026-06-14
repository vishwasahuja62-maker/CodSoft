const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.SUPABASE_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'SUPABASE_DATABASE_URL not set in .env. ' +
      'Get it from your Supabase project: Settings > Database > Connection string (URI)'
    );
  }

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (err) => {
    console.error('Supabase pool error:', err.message);
  });

  return pool;
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2, ... style
function convertParams(sql, params) {
  let idx = 0;
  const converted = sql.replace(/\?/g, () => `$${++idx}`);

  // Automatically add RETURNING id for INSERT statements that don't have it
  let finalSql = converted;
  if (/^\s*INSERT\s*/i.test(finalSql) && !/RETURNING\s/i.test(finalSql)) {
    finalSql += ' RETURNING id';
  }

  return { sql: finalSql, params };
}

// Wrapper: get single row (like SQLite dbGet)
async function dbGet(sql, params = []) {
  const client = getPool();
  const { sql: pgSql, params: pgParams } = convertParams(sql, params);
  const result = await client.query(pgSql, pgParams);
  return result.rows[0] || null;
}

// Wrapper: get multiple rows (like SQLite dbAll)
async function dbAll(sql, params = []) {
  const client = getPool();
  const { sql: pgSql, params: pgParams } = convertParams(sql, params);
  const result = await client.query(pgSql, pgParams);
  return result.rows;
}

// Wrapper: run mutation (like SQLite dbRun)
async function dbRun(sql, params = []) {
  const client = getPool();
  const { sql: pgSql, params: pgParams } = convertParams(sql, params);
  const result = await client.query(pgSql, pgParams);
  return {
    lastID: result.rows[0]?.id || result.rows[0]?.lastID || null,
    changes: result.rowCount,
  };
}

// Run raw SQL (for migrations)
async function dbRaw(sql) {
  const client = getPool();
  await client.query(sql);
}

// Test connection
async function testConnection() {
  try {
    const result = await dbGet('SELECT NOW() as current_time');
    console.log(`✅ Supabase connected at ${result.current_time}`);
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    return false;
  }
}

module.exports = { dbGet, dbAll, dbRun, dbRaw, testConnection };
