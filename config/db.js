require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('../db/schema');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Use single DATABASE_URL connection string (works with NeonDB and other PostgreSQL providers)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false,
});

// Initialize Drizzle with the pool and schema
const db = drizzle(pool, { schema });

// Test the database connection
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected...');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

// If running this file directly, test the connection
if (require.main === module) {
  connectDB()
    .then(() => {
      console.log('Connection test successful!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Connection test failed:', err.message);
      process.exit(1);
    });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  connectDB,
  pool,
  db,
  schema,
};
