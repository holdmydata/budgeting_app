// Load environment variables
require('dotenv').config();
const knex = require('knex');

// Check if all required environment variables are set
const requiredVars = ['DB_HOST', 'DB_PASSWORD', 'DB_HTTP_PATH', 'DB_CATALOG', 'DB_SCHEMA'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file');
  process.exit(1);
}

// Configure Databricks connection
const knexConfig = {
  client: 'databricks-sql-node',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 443,
    token: process.env.DB_PASSWORD,
    path: process.env.DB_HTTP_PATH,
    httpPath: process.env.DB_HTTP_PATH,
    catalog: process.env.DB_CATALOG,
    schema: process.env.DB_SCHEMA,
    protocol: 'https',
  },
  pool: {
    min: 1,
    max: 2
  }
};

console.log('Attempting to connect to Databricks SQL...');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`HTTP Path: ${process.env.DB_HTTP_PATH}`);
console.log(`Catalog: ${process.env.DB_CATALOG}`);
console.log(`Schema: ${process.env.DB_SCHEMA}`);

// Create knex instance and test connection
const db = knex(knexConfig);

// Test query - list tables
db.raw('SHOW TABLES')
  .then(result => {
    console.log('Connection successful!');
    console.log('Tables in your schema:');
    console.table(result);
    
    // Try to query a specific table if it exists
    return db.raw('SELECT COUNT(*) FROM transactions LIMIT 1')
      .catch(err => {
        console.log('Could not query transactions table. It may not exist yet.');
        return { count: 0 };
      });
  })
  .then(result => {
    if (result.count !== undefined) {
      console.log(`Transaction count: ${result.count}`);
    }
    console.log('Test completed successfully.');
  })
  .catch(error => {
    console.error('Connection failed with the following error:');
    console.error(error);
    
    // Provide helpful debugging information
    console.log('\nDebugging information:');
    console.log('- Check if your Databricks SQL endpoint is running');
    console.log('- Verify your personal access token has the correct permissions');
    console.log('- Make sure your IP is allowed in the Databricks workspace network settings');
    console.log('- Confirm catalog and schema names are correct');
    console.log('- Check that the HTTP path is correct (found in the connection details of your SQL warehouse)');
  })
  .finally(() => {
    db.destroy();
  }); 