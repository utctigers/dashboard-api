const { Pool } = require('pg');
require('dotenv').config();

async function testAuroraConnection() {
  const pool = new Pool({
    host: process.env.AURORA_ENDPOINT || '4vthvxld47txd4lmgqpjzagqki.dsql.us-east-1.on.aws',
    port: process.env.AURORA_PORT || 5432,
    database: process.env.AURORA_DATABASE || 'postgres',
    user: process.env.AURORA_USER,
    password: process.env.AURORA_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  console.log('🧪 Testing Aurora DSQL Connection...');
  console.log('Host:', process.env.AURORA_ENDPOINT || '4vthvxld47txd4lmgqpjzagqki.dsql.us-east-1.on.aws');
  console.log('Port:', process.env.AURORA_PORT || 5432);
  console.log('Database:', process.env.AURORA_DATABASE || 'postgres');
  console.log('User:', process.env.AURORA_USER || 'NOT SET');
  console.log('');

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Aurora DSQL successfully!');
    
    // Test basic query
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Test query successful:', result.rows[0]);
    
    // Test if employees table exists
    try {
      const tableCheck = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employees')");
      if (tableCheck.rows[0].exists) {
        console.log('✅ Employees table exists');
        
        const count = await client.query('SELECT COUNT(*) FROM employees');
        console.log('📊 Employee count:', count.rows[0].count);
      } else {
        console.log('⚠️ Employees table does not exist - need to create schema');
      }
    } catch (tableError) {
      console.log('⚠️ Could not check employees table:', tableError.message);
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Aurora DSQL Connection Failed:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 DNS resolution failed - check endpoint URL');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused - check port and firewall');
    } else if (error.code === '28000' || error.code === '28P01') {
      console.log('💡 Authentication failed - check username/password');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Connection timeout - check network connectivity');
    }
  } finally {
    await pool.end();
  }
}

testAuroraConnection();