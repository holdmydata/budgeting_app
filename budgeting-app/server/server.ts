// Load environment variables from .env file if present
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DBSQLClient } = require('@databricks/sql');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
import { Request, Response, NextFunction } from 'express';

const app = express();
const port = process.env.PORT || 5000;
const connectionTimeout = parseInt(process.env.CONNECTION_TIMEOUT || '1800000', 10); // Default to 30 minutes

// Parse allowed origins from environment or default to all
let corsOptions: any = {};
if (process.env.ALLOWED_ORIGINS) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  };
}

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Store active connections
const connections = new Map();

// Error handling middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: true, 
    message: err.message || 'Internal server error' 
  });
};

// Connect to Databricks
app.post('/api/databricks/connect', async (req: Request, res: Response) => {
  try {
    const { workspaceUrl, httpPath, warehouseId, catalog, schema, apiKey } = req.body;
    
    // Validate required fields
    if (!workspaceUrl || !httpPath) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required connection parameters' 
      });
    }
    
    // Generate a unique session ID
    const sessionId = Date.now().toString();
    
    // Create Databricks client
    const client = new DBSQLClient();
    
    // Connect to Databricks
    await client.connect({
      host: workspaceUrl,
      path: httpPath,
      token: apiKey
    });
    
    // Open a session with catalog and schema
    const sessionOptions: { initialCatalog?: string; initialSchema?: string } = {};
    if (catalog) sessionOptions.initialCatalog = catalog;
    if (schema) sessionOptions.initialSchema = schema;
    
    const session = await client.openSession(sessionOptions);
    
    // Store the connection
    connections.set(sessionId, { client, session });
    
    // Set a timeout to automatically close the connection
    setTimeout(() => {
      if (connections.has(sessionId)) {
        closeConnection(sessionId);
      }
    }, connectionTimeout);
    
    // Return success with session ID
    res.json({
      success: true,
      message: 'Connected to Databricks successfully',
      sessionId
    });
  } catch (error: any) {
    console.error('Failed to connect to Databricks:', error);
    res.status(500).json({ 
      error: true, 
      message: `Failed to connect to Databricks: ${error.message}` 
    });
  }
});

// Test connection
app.post('/api/databricks/test', async (req: Request, res: Response) => {
  try {
    const { workspaceUrl, httpPath, warehouseId, catalog, schema, apiKey } = req.body;
    
    // Validate required fields
    if (!workspaceUrl || !httpPath) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required connection parameters' 
      });
    }
    
    // Create temporary client for testing
    const client = new DBSQLClient();
    
    // Connect to Databricks
    await client.connect({
      host: workspaceUrl,
      path: httpPath,
      token: apiKey
    });
    
    // Open a temporary session
    const sessionOptions: { initialCatalog?: string; initialSchema?: string } = {};
    if (catalog) sessionOptions.initialCatalog = catalog;
    if (schema) sessionOptions.initialSchema = schema;
    
    const session = await client.openSession(sessionOptions);
    
    // Execute a simple test query
    const operation = await session.executeStatement('SELECT 1 as test');
    await operation.fetchAll();
    await operation.close();
    
    // Close the session and client
    await session.close();
    await client.close();
    
    // Return success
    res.json({
      success: true,
      message: 'Databricks connection test successful'
    });
  } catch (error: any) {
    console.error('Databricks connection test failed:', error);
    res.status(500).json({ 
      error: true, 
      message: `Databricks connection test failed: ${error.message}` 
    });
  }
});

// Close connection
app.post('/api/databricks/disconnect', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId || !connections.has(sessionId)) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invalid or expired session' 
      });
    }
    
    // Close the connection
    await closeConnection(sessionId);
    
    res.json({
      success: true,
      message: 'Disconnected from Databricks successfully'
    });
  } catch (error: any) {
    console.error('Failed to disconnect from Databricks:', error);
    res.status(500).json({ 
      error: true, 
      message: `Failed to disconnect: ${error.message}` 
    });
  }
});

// Helper function to close connection
async function closeConnection(sessionId: string) {
  try {
    const connection = connections.get(sessionId);
    if (connection) {
      const { client, session } = connection;
      
      if (session) await session.close();
      if (client) await client.close();
      
      connections.delete(sessionId);
      console.log(`Closed Databricks connection for session ${sessionId}`);
    }
  } catch (error: any) {
    console.error(`Error closing connection ${sessionId}:`, error);
  }
}

// Execute query
app.post('/api/databricks/query', async (req: Request, res: Response) => {
  try {
    const { sessionId, query } = req.body;
    
    if (!sessionId || !connections.has(sessionId)) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invalid or expired session' 
      });
    }
    
    if (!query) {
      return res.status(400).json({ 
        error: true, 
        message: 'Query is required' 
      });
    }
    
    const { session } = connections.get(sessionId);
    
    // Execute the query
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Query execution failed:', error);
    res.status(500).json({ 
      error: true, 
      message: `Query execution failed: ${error.message}` 
    });
  }
});

// Fetch KPIs
app.get('/api/kpis', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId || !connections.has(sessionId)) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invalid or expired session' 
      });
    }
    
    const { session } = connections.get(sessionId);
    
    const query = `
      SELECT 
        id,
        title,
        value,
        formattedValue,
        change,
        secondaryValue
      FROM kpi_view
    `;
    
    // Execute the query
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
    res.json(results);
  } catch (error: any) {
    console.error('Failed to fetch KPIs:', error);
    res.status(500).json({ 
      error: true, 
      message: `Failed to fetch KPIs: ${error.message}` 
    });
  }
});

// Fetch GL Accounts
app.get('/api/gl-accounts', async (req: Request, res: Response) => {
  try {
    const { sessionId, ...filters } = req.query;
    
    if (!sessionId || !connections.has(sessionId)) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invalid or expired session' 
      });
    }
    
    const { session } = connections.get(sessionId);
    
    // Build WHERE clause based on filters
    const whereClause = Object.keys(filters).length > 0 
      ? 'WHERE ' + Object.entries(filters)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ')
      : '';
    
    const query = `
      SELECT 
        id,
        account_number as accountNumber,
        account_name as accountName,
        account_type as accountType,
        is_active as isActive,
        department_id as departmentId,
        created_at as createdAt,
        updated_at as updatedAt
      FROM gl_accounts
      ${whereClause}
    `;
    
    // Execute the query
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
    res.json(results);
  } catch (error: any) {
    console.error('Failed to fetch GL accounts:', error);
    res.status(500).json({ 
      error: true, 
      message: `Failed to fetch GL accounts: ${error.message}` 
    });
  }
});

// Fetch Projects
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const { sessionId, ...filters } = req.query;
    
    if (!sessionId || !connections.has(sessionId)) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invalid or expired session' 
      });
    }
    
    const { session } = connections.get(sessionId);
    
    // Build WHERE clause based on filters
    const whereClause = Object.keys(filters).length > 0 
      ? 'WHERE ' + Object.entries(filters)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ')
      : '';
    
    const query = `
      SELECT 
        id,
        project_code as projectCode,
        project_name as projectName,
        description,
        start_date as startDate,
        end_date as endDate,
        budget,
        spent,
        status,
        owner,
        priority,
        gl_account as glAccount,
        created_at as createdAt,
        updated_at as updatedAt
      FROM projects
      ${whereClause}
    `;
    
    // Execute the query
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
    res.json(results);
  } catch (error: any) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ 
      error: true, 
      message: `Failed to fetch projects: ${error.message}` 
    });
  }
});

// Fetch Transactions
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    const { sessionId, ...filters } = req.query;
    
    if (!sessionId || !connections.has(sessionId)) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invalid or expired session' 
      });
    }
    
    const { session } = connections.get(sessionId);
    
    // Build WHERE clause based on filters
    const whereClause = Object.keys(filters).length > 0 
      ? 'WHERE ' + Object.entries(filters)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ')
      : '';
    
    const query = `
      SELECT 
        id,
        transaction_date as transactionDate,
        amount,
        description,
        gl_account as glAccount,
        project_id as projectId,
        transaction_type as transactionType,
        vendor_id as vendorId,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM financial_transactions
      ${whereClause}
    `;
    
    // Execute the query
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
    res.json(results);
  } catch (error: any) {
    console.error('Failed to fetch transactions:', error);
    res.status(500).json({ 
      error: true, 
      message: `Failed to fetch transactions: ${error.message}` 
    });
  }
});

// Fetch Budget Entries
app.get('/api/budget-entries', async (req: Request, res: Response) => {
  try {
    const { sessionId, ...filters } = req.query;
    
    if (!sessionId || !connections.has(sessionId)) {
      return res.status(404).json({ 
        error: true, 
        message: 'Invalid or expired session' 
      });
    }
    
    const { session } = connections.get(sessionId);
    
    // Build WHERE clause based on filters
    const whereClause = Object.keys(filters).length > 0 
      ? 'WHERE ' + Object.entries(filters)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ')
      : '';
    
    const query = `
      SELECT 
        id,
        gl_account as glAccount,
        project_id as projectId,
        fiscal_year as fiscalYear,
        fiscal_month as fiscalMonth,
        amount,
        notes,
        created_at as createdAt,
        updated_at as updatedAt
      FROM budget_entries
      ${whereClause}
    `;
    
    // Execute the query
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
    res.json(results);
  } catch (error: any) {
    console.error('Failed to fetch budget entries:', error);
    res.status(500).json({ 
      error: true, 
      message: `Failed to fetch budget entries: ${error.message}` 
    });
  }
});

// Server status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    activeConnections: connections.size,
    serverTime: new Date().toISOString()
  });
});

// GraphQL Schema Definition
const typeDefs = `#graphql
  type KPI {
    id: ID
    title: String
    value: Float
    formattedValue: String
    change: Float
    secondaryValue: String
  }

  type GLAccount {
    id: ID
    accountNumber: String
    accountName: String
    accountType: String
    isActive: Boolean
    departmentId: String
    createdAt: String
    updatedAt: String
  }

  type Project {
    id: ID
    projectCode: String
    projectName: String
    description: String
    startDate: String
    endDate: String
    budget: Float
    spent: Float
    status: String
    owner: String
    priority: String
    glAccount: String
    createdAt: String
    updatedAt: String
  }

  type Transaction {
    id: ID
    transactionDate: String
    amount: Float
    description: String
    glAccount: String
    projectId: String
    transactionType: String
    vendorId: String
    status: String
    createdAt: String
    updatedAt: String
  }

  type BudgetEntry {
    id: ID
    glAccount: String
    projectId: String
    fiscalYear: Int
    fiscalMonth: Int
    amount: Float
    notes: String
    createdAt: String
    updatedAt: String
  }

  type Vendor {
    id: ID
    vendorCode: String
    vendorName: String
    category: String
    contactName: String
    contactEmail: String
    contactPhone: String
    performanceScore: Float
    isActive: Boolean
    createdAt: String
    updatedAt: String
  }

  type Query {
    kpis(sessionId: String!): [KPI]
    glAccounts(sessionId: String!, accountType: String, isActive: Boolean): [GLAccount]
    projects(sessionId: String!, status: String, priority: String): [Project]
    transactions(sessionId: String!, projectId: String, glAccount: String): [Transaction]
    budgetEntries(sessionId: String!, projectId: String, fiscalYear: Int): [BudgetEntry]
    vendors(sessionId: String!, isActive: Boolean, category: String): [Vendor]
  }

  input ProjectInput {
    projectCode: String
    projectName: String
    description: String
    startDate: String
    endDate: String
    budget: Float
    spent: Float
    status: String
    owner: String
    priority: String
    glAccount: String
  }

  input VendorInput {
    vendorCode: String
    vendorName: String
    category: String
    contactName: String
    contactEmail: String
    contactPhone: String
    performanceScore: Float
    isActive: Boolean
  }

  input TransactionInput {
    transactionDate: String
    amount: Float
    description: String
    glAccount: String
    projectId: String
    transactionType: String
    vendorId: String
    status: String
  }

  input BudgetEntryInput {
    glAccount: String!
    projectId: String!
    fiscalYear: Int!
    fiscalMonth: Int!
    amount: Float!
    notes: String
  }

  input BudgetEntryUpdateInput {
    glAccount: String
    projectId: String
    fiscalYear: Int
    fiscalMonth: Int
    amount: Float
    notes: String
  }

  type Mutation {
    addProject(sessionId: String!, input: ProjectInput!): Project
    updateProject(sessionId: String!, id: ID!, input: ProjectInput!): Project
    deleteProject(sessionId: String!, id: ID!): Boolean
    addVendor(sessionId: String!, input: VendorInput!): Vendor
    updateVendor(sessionId: String!, id: ID!, input: VendorInput!): Vendor
    deleteVendor(sessionId: String!, id: ID!): Boolean
    addTransaction(sessionId: String!, input: TransactionInput!): Transaction
    updateTransaction(sessionId: String!, id: ID!, input: TransactionInput!): Transaction
    deleteTransaction(sessionId: String!, id: ID!): Boolean
    createBudgetEntry(sessionId: String!, input: BudgetEntryInput!): BudgetEntry
    updateBudgetEntry(sessionId: String!, id: ID!, input: BudgetEntryUpdateInput!): BudgetEntry
    deleteBudgetEntry(sessionId: String!, id: ID!): Boolean
  }
`;

// Import resolvers from the new resolvers.js file
// Use require for now, as resolvers is likely CommonJS
// If you migrate resolvers.ts to ES module, use import
// eslint-disable-next-line @typescript-eslint/no-var-requires
const resolvers = require('./resolvers');

// Initialize Apollo Server
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // Enable schema introspection for development
  });
  
  // Start Apollo Server
  await server.start();
  
  // Apply Apollo middleware to Express
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }: { req: Request }) => {
      return { req };
    },
  }));
  
  console.log('GraphQL server initialized at /graphql');
}

// Apply middleware
app.use(errorHandler);

// Start the server
(async () => {
  await startApolloServer();
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Configuration: Connection timeout ${connectionTimeout}ms`);
    console.log(`GraphQL endpoint available at http://localhost:${port}/graphql`);
  });
})();

module.exports = app;
module.exports.connections = connections; 