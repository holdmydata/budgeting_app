// Load environment variables
require('dotenv').config();

const getDatabricksConfig = () => {
  if (process.env.DB_DRIVER !== 'databricks') {
    return null;
  }
  
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 443,
    token: process.env.DB_PASSWORD,
    path: process.env.DB_HTTP_PATH,
    catalog: process.env.DB_CATALOG,
    schema: process.env.DB_SCHEMA,
    httpPath: process.env.DB_HTTP_PATH,
    protocol: 'https',
  };
};

const getPostgresConfig = (env = 'development') => {
  const isTest = env === 'test';
  const prefix = isTest ? 'TEST_' : '';
  
  return {
    host: process.env[`${prefix}DB_HOST`] || 'localhost',
    port: process.env[`${prefix}DB_PORT`] || 5432,
    user: process.env[`${prefix}DB_USER`] || 'postgres',
    password: process.env[`${prefix}DB_PASSWORD`] || 'postgres',
    database: process.env[`${prefix}DB_NAME`] || (isTest ? 'financial_test_db' : 'financial_db'),
    ...(env === 'production' ? { ssl: { rejectUnauthorized: false } } : {})
  };
};

module.exports = {
  development: {
    client: process.env.DB_DRIVER === 'databricks' ? 'databricks-sql-node' : 'pg',
    connection: process.env.DB_DRIVER === 'databricks' 
      ? getDatabricksConfig() 
      : getPostgresConfig('development'),
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  test: {
    client: 'pg',
    connection: getPostgresConfig('test'),
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: process.env.DB_DRIVER === 'databricks' ? 'databricks-sql-node' : 'pg',
    connection: process.env.DB_DRIVER === 'databricks' 
      ? getDatabricksConfig() 
      : getPostgresConfig('production'),
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    }
  }
}; 