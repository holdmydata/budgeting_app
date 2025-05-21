// GraphQL Resolvers for Hold My Budget
// This file contains all resolver logic for the GraphQL API

// Import the connections map from server.js
const { connections } = require("./server");

const resolvers = {
  Query: {
    kpis: async (_: any, { sessionId }: { sessionId: string }) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
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
      {
        sessionId,
        accountType,
        isActive,
      }: { sessionId: string; accountType?: string; isActive?: boolean }
    ) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (accountType) whereConditions.push(`account_type = '${accountType}'`);
      if (isActive !== undefined)
        whereConditions.push(`is_active = ${isActive}`);
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";
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
      {
        sessionId,
        status,
        priority,
      }: { sessionId: string; status?: string; priority?: string }
    ) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (status) whereConditions.push(`status = '${status}'`);
      if (priority) whereConditions.push(`priority = '${priority}'`);
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";
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
      {
        sessionId,
        projectId,
        glAccount,
      }: { sessionId: string; projectId?: string; glAccount?: string }
    ) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (projectId) whereConditions.push(`project_id = '${projectId}'`);
      if (glAccount) whereConditions.push(`gl_account = '${glAccount}'`);
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";
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
      {
        sessionId,
        projectId,
        fiscalYear,
      }: { sessionId: string; projectId?: string; fiscalYear?: number }
    ) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (projectId) whereConditions.push(`project_id = '${projectId}'`);
      if (fiscalYear) whereConditions.push(`fiscal_year = ${fiscalYear}`);
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";
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
    },
    vendors: async (_: any, { sessionId, isActive, category }: { sessionId: string; isActive?: boolean; category?: string }) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const whereConditions = [];
      if (isActive !== undefined) whereConditions.push(`is_active = ${isActive}`);
      if (category) whereConditions.push(`category = '${category}'`);
      const whereClause =
        whereConditions.length > 0
          ? "WHERE " + whereConditions.join(" AND ")
          : "";
      const query = `
        SELECT 
          id,
          vendor_code as vendorCode,
          vendor_name as vendorName,
          category,
          contact_name as contactName,
          contact_email as contactEmail,
          contact_phone as contactPhone,
          performance_score as performanceScore,
          is_active as isActive,
          created_at as createdAt,
          updated_at as updatedAt
        FROM vendors
        ${whereClause}
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results;
    },
  },
  Mutation: {
    addProject: async (_: any, { sessionId, input }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const fields = Object.keys(input).join(", ");
      const values = Object.values(input).map(v => typeof v === 'string' ? `'${v}'` : v).join(", ");
      const query = `
        INSERT INTO projects (${fields}, created_at, updated_at)
        VALUES (${values}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results[0];
    },
    updateProject: async (_: any, { sessionId, id, input }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const setClause = Object.entries(input)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(", ");
      const query = `
        UPDATE projects
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = '${id}'
        RETURNING *
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results[0];
    },
    deleteProject: async (_: any, { sessionId, id }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const query = `
        DELETE FROM projects WHERE id = '${id}'
      `;
      const operation = await session.executeStatement(query);
      // Databricks SQL doesn't return affectedRows, so check if row still exists
      const checkQuery = `SELECT id FROM projects WHERE id = '${id}'`;
      const checkOp = await session.executeStatement(checkQuery);
      const checkResults = await checkOp.fetchAll();
      await operation.close();
      await checkOp.close();
      return checkResults.length === 0;
    },
    addVendor: async (_: any, { sessionId, input }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const fields = Object.keys(input).join(", ");
      const values = Object.values(input).map(v => typeof v === 'string' ? `'${v}'` : v).join(", ");
      const query = `
        INSERT INTO vendors (${fields}, created_at, updated_at)
        VALUES (${values}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results[0];
    },
    updateVendor: async (_: any, { sessionId, id, input }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const setClause = Object.entries(input)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(", ");
      const query = `
        UPDATE vendors
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = '${id}'
        RETURNING *
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results[0];
    },
    deleteVendor: async (_: any, { sessionId, id }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const query = `
        DELETE FROM vendors WHERE id = '${id}'
      `;
      const operation = await session.executeStatement(query);
      // Databricks SQL doesn't return affectedRows, so check if row still exists
      const checkQuery = `SELECT id FROM vendors WHERE id = '${id}'`;
      const checkOp = await session.executeStatement(checkQuery);
      const checkResults = await checkOp.fetchAll();
      await operation.close();
      await checkOp.close();
      return checkResults.length === 0;
    },
    addTransaction: async (_: any, { sessionId, input }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const fields = Object.keys(input).join(", ");
      const values = Object.values(input).map(v => typeof v === 'string' ? `'${v}'` : v).join(", ");
      const query = `
        INSERT INTO financial_transactions (${fields}, created_at, updated_at)
        VALUES (${values}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results[0];
    },
    updateTransaction: async (_: any, { sessionId, id, input }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const setClause = Object.entries(input)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(", ");
      const query = `
        UPDATE financial_transactions
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = '${id}'
        RETURNING *
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results[0];
    },
    deleteTransaction: async (_: any, { sessionId, id }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const query = `
        DELETE FROM financial_transactions WHERE id = '${id}'
      `;
      const operation = await session.executeStatement(query);
      const checkQuery = `SELECT id FROM financial_transactions WHERE id = '${id}'`;
      const checkOp = await session.executeStatement(checkQuery);
      const checkResults = await checkOp.fetchAll();
      await operation.close();
      await checkOp.close();
      return checkResults.length === 0;
    },
    createBudgetEntry: async (_: any, { sessionId, input }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const fields = Object.keys(input).join(", ");
      const values = Object.values(input).map(v => typeof v === 'string' ? `'${v}'` : v).join(", ");
      const query = `
        INSERT INTO budget_entries (${fields}, created_at, updated_at)
        VALUES (${values}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results[0];
    },
    updateBudgetEntry: async (_: any, { sessionId, id, input }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const setClause = Object.entries(input)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ${typeof value === 'string' ? `'${value}'` : value}`)
        .join(", ");
      const query = `
        UPDATE budget_entries
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = '${id}'
        RETURNING *
      `;
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      return results[0];
    },
    deleteBudgetEntry: async (_: any, { sessionId, id }: any) => {
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error("Invalid or expired session");
      }
      const { session } = connections.get(sessionId);
      const query = `
        DELETE FROM budget_entries WHERE id = '${id}'
      `;
      const operation = await session.executeStatement(query);
      const checkQuery = `SELECT id FROM budget_entries WHERE id = '${id}'`;
      const checkOp = await session.executeStatement(checkQuery);
      const checkResults = await checkOp.fetchAll();
      await operation.close();
      await checkOp.close();
      return checkResults.length === 0;
    },
  },
};

module.exports = resolvers;
