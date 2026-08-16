/**
 * Database setup script — run once to create schema and seed data
 * Usage: node db/setup.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

async function setup() {
  console.log('🔧 Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'vedant',
    multipleStatements: true,
  });

  try {
    // Run schema
    console.log('📦 Creating database and tables...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(schema);
    console.log('✅ Schema applied');

    // Run seed
    console.log('🌱 Seeding data...');
    const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await conn.query(seed);
    console.log('✅ Seed data inserted');

    // Verify
    const [products] = await conn.query('SELECT COUNT(*) as count FROM linkit_db.products');
    const [txns]     = await conn.query('SELECT COUNT(*) as count FROM linkit_db.transactions');
    const [users]    = await conn.query('SELECT COUNT(*) as count FROM linkit_db.users');
    console.log(`\n📊 Database ready:`);
    console.log(`   Users:        ${users[0].count}`);
    console.log(`   Products:     ${products[0].count}`);
    console.log(`   Transactions: ${txns[0].count}`);
    console.log(`\n🚀 Ready! Run: npm run dev\n`);
  } catch (err) {
    console.error('❌ Setup error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  Some data already exists (duplicate entries). That is fine — skipping.\n');
    }
  } finally {
    await conn.end();
  }
}

setup();
