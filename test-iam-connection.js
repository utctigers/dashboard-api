const { Pool } = require('pg');
const { Signer } = require('@aws-sdk/rds-signer');
require('dotenv').config();

async function testIAMConnection() {
  console.log('🧪 Testing Aurora DSQL IAM Connection...');
  console.log('Host:', process.env.AURORA_ENDPOINT);
  console.log('User:', process.env.AURORA_USER);
  console.log('Region:', process.env.AWS_REGION);
  console.log('');

  try {
    // Generate IAM auth token
    const signer = new Signer({
      region: process.env.AWS_REGION || 'us-east-1',
      hostname: process.env.AURORA_ENDPOINT,
      port: process.env.AURORA_PORT || 5432,
      username: process.env.AURORA_USER || 'admin'
    });

    console.log('🔑 Generating IAM auth token...');
    const authToken = await signer.getAuthToken();
    console.log('✅ IAM token generated successfully');
    console.log('Token length:', authToken.length);

    // Create connection with IAM token
    const pool = new Pool({
      host: process.env.AURORA_ENDPOINT,
      port: process.env.AURORA_PORT || 5432,
      database: process.env.AURORA_DATABASE || 'postgres',
      user: process.env.AURORA_USER || 'admin',
      password: authToken,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    console.log('🔗 Connecting to Aurora DSQL...');
    const client = await pool.connect();
    console.log('✅ Connected to Aurora DSQL with IAM auth!');

    // Test query
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Test query successful:', result.rows[0]);

    client.release();
    await pool.end();

  } catch (error) {
    console.error('❌ IAM Connection Failed:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    if (error.message.includes('credentials')) {
      console.log('💡 Check AWS credentials configuration');
    } else if (error.code === '28000') {
      console.log('💡 IAM authentication failed - check user permissions');
    }
  }
}

testIAMConnection();