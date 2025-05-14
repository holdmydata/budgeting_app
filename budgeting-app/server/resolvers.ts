// GraphQL Resolvers for Hold My Budget
// This file contains all resolver logic for the GraphQL API

// Import the connections map from server.js
const { connections } = require('./server');

const resolvers = {
  Query: {
    kpis: async (_: any, { sessionId }: { sessionId: string }) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error('Invalid or expired session');
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
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results;
    },
    glAccounts: async (
      _: any,
      { sessionId, accountType, isActive }: { sessionId: string; accountType?: string; isActive?: boolean }
    ) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error('Invalid or expired session');
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (accountType) whereConditions.push(`account_type = '${accountType}'`);
      if (isActive !== undefined) whereConditions.push(`is_active = ${isActive}`);
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
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
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results;
    },
    projects: async (
      _: any,
      { sessionId, status, priority }: { sessionId: string; status?: string; priority?: string }
    ) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error('Invalid or expired session');
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (status) whereConditions.push(`status = '${status}'`);
      if (priority) whereConditions.push(`priority = '${priority}'`);
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
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
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results;
    },
    transactions: async (
      _: any,
      { sessionId, projectId, glAccount }: { sessionId: string; projectId?: string; glAccount?: string }
    ) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error('Invalid or expired session');
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (projectId) whereConditions.push(`project_id = '${projectId}'`);
      if (glAccount) whereConditions.push(`gl_account = '${glAccount}'`);
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
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
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results;
    },
    budgetEntries: async (
      _: any,
      { sessionId, projectId, fiscalYear }: { sessionId: string; projectId?: string; fiscalYear?: number }
    ) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error('Invalid or expired session');
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (projectId) whereConditions.push(`project_id = '${projectId}'`);
      if (fiscalYear) whereConditions.push(`fiscal_year = ${fiscalYear}`);
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
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
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results;
    }
  }
};

module.exports = resolvers; 