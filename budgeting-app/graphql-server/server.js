const { ApolloServer } = require('apollo-server');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const knex = require('knex');

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
  client: 'pg',
  connection: {
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
server.listen().then(({ url }) => {
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