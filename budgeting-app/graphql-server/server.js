const { ApolloServer } = require('apollo-server');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const knex = require('knex');
require('dotenv').config();

// Import data sources
const TransactionsAPI = require('./dataSources/TransactionsAPI');
const AccountsAPI = require('./dataSources/AccountsAPI');
const BudgetAPI = require('./dataSources/BudgetAPI');

// Import resolvers
const resolvers = require('./resolvers');

// Read the schema
const typeDefs = readFileSync(resolve(__dirname, 'schema.graphql'), 'utf-8');

// Configure database connection
const knexConfig = {
  client: process.env.DB_DRIVER === 'databricks' ? 'databricks-sql-node' : 'pg',
  connection: process.env.DB_DRIVER === 'databricks' 
    ? {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 443,
        token: process.env.DB_PASSWORD,
        path: process.env.DB_HTTP_PATH,
        catalog: process.env.DB_CATALOG,
        schema: process.env.DB_SCHEMA,
        httpPath: process.env.DB_HTTP_PATH,
        protocol: 'https',
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'financial_db',
      },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};

// Initialize knex
const knexInstance = knex(knexConfig);

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    transactionsAPI: new TransactionsAPI({ knexInstance }),
    accountsAPI: new AccountsAPI({ knexInstance }),
    budgetAPI: new BudgetAPI({ knexInstance })
  }),
  context: async ({ req }) => {
    // You can add authentication logic here
    return {
      user: req.headers.user || null
    };
  }
});

// Start the server
const port = process.env.PORT || 4000;
server.listen(port).then(({ url }) => {
  console.log(`🚀 Financial GraphQL API ready at ${url}`);
});

// Handle shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  await server.stop();
  await knexInstance.destroy();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown); 