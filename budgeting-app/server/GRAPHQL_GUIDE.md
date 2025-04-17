# GraphQL Implementation Guide

This guide provides a visual overview of how GraphQL works in our budgeting application, focusing on practical use cases and examples.

## GraphQL vs REST: Visual Comparison

```
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│             REST API                │    │             GraphQL API              │
├─────────────────────────────────────┤    ├─────────────────────────────────────┤
│                                     │    │                                     │
│  /api/projects                      │    │  {                                  │
│  /api/transactions                  │    │    projects {                       │
│  /api/budget-entries                │    │      id                             │
│  /api/gl-accounts                   │    │      name                           │
│                                     │    │      transactions {                 │
│  Multiple requests                  │    │        amount                       │
│  Over-fetching                      │    │      }                              │
│  Under-fetching                     │    │      budgetEntries {                │
│                                     │    │        fiscalMonth                  │
│                                     │    │        amount                       │
│                                     │    │      }                              │
│                                     │    │    }                                │
│                                     │    │  }                                  │
│                                     │    │                                     │
│                                     │    │  Single request                     │
│                                     │    │  Exact data needed                  │
└─────────────────────────────────────┘    └─────────────────────────────────────┘
```

## Budget Lines Workflow

### 1. Data Flow Overview

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Client App   │◄────►│  GraphQL API  │◄────►│ Databricks SQL│
└───────────────┘      └───────────────┘      └───────────────┘
       ▲                                              ▲
       │                                              │
       │                                              │
       │                                              │
       ▼                                              ▼
┌───────────────┐                            ┌───────────────┐
│   UI Tables   │                            │ Database Table│
└───────────────┘                            └───────────────┘
```

### 2. Fetching Budget Lines with GraphQL

```graphql
# Get budget entries with associated project and GL account info
query {
  budgetEntries(sessionId: "1234567890", fiscalYear: 2023) {
    id
    amount
    fiscalMonth
    fiscalYear
    notes
    # Associated data in a single query
    project {
      id
      projectName
      budget
      spent
    }
    glAccount {
      id
      accountName
      accountType
    }
  }
}
```

### 3. Creating/Updating Budget Lines (Mutations)

```graphql
# Add a new budget entry
mutation {
  createBudgetEntry(
    sessionId: "1234567890", 
    input: {
      projectId: "PRJ-001",
      glAccount: "GL-101",
      fiscalYear: 2023,
      fiscalMonth: 6,
      amount: 5000,
      notes: "Q2 marketing budget"
    }
  ) {
    id
    amount
    fiscalMonth
  }
}

# Update an existing budget entry
mutation {
  updateBudgetEntry(
    sessionId: "1234567890", 
    id: "BE-123",
    input: {
      amount: 7500,
      notes: "Revised Q2 marketing budget"
    }
  ) {
    id
    amount
    notes
  }
}
```

## Custom Measures Implementation

With GraphQL, you can add computed fields that don't exist directly in your database:

```graphql
type Project {
  id: ID
  projectName: String
  budget: Float
  spent: Float
  
  # Computed fields (custom measures)
  remainingBudget: Float
  utilizationPercentage: Float
  monthlySpending: [MonthlySpend]
}

type MonthlySpend {
  month: Int
  year: Int
  amount: Float
}
```

Implementation in your resolvers:

```javascript
const resolvers = {
  Project: {
    // Custom measure: Calculate remaining budget
    remainingBudget: (project) => {
      return project.budget - project.spent;
    },
    
    // Custom measure: Calculate utilization percentage
    utilizationPercentage: (project) => {
      if (project.budget === 0) return 0;
      return (project.spent / project.budget) * 100;
    },
    
    // Custom measure: Monthly spending breakdown
    monthlySpending: async (project, args, context) => {
      const { sessionId } = context;
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error('Invalid session');
      }
      
      const { session } = connections.get(sessionId);
      
      const query = `
        SELECT 
          MONTH(transaction_date) as month,
          YEAR(transaction_date) as year,
          SUM(amount) as amount
        FROM financial_transactions
        WHERE project_id = '${project.id}'
        GROUP BY YEAR(transaction_date), MONTH(transaction_date)
        ORDER BY YEAR(transaction_date), MONTH(transaction_date)
      `;
      
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      
      return results;
    }
  }
}
```

## Pushing Budget Lines Back to Database

When updating budget lines through GraphQL, the flow works like this:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────►│  GraphQL    │────►│  Resolver   │────►│  Database   │
│   Request   │     │  Server     │     │  Function   │     │  Update     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ updateBudget│     │  Validate   │     │ Execute SQL │     │ Row Updated │
│ Mutation    │     │  Input      │     │ Update      │     │ in Table    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Implementation Example:

```javascript
// Mutation resolver for updating budget entries
const resolvers = {
  Mutation: {
    updateBudgetEntry: async (_, { sessionId, id, input }, context) => {
      // Validate session
      if (!sessionId || !connections.has(sessionId)) {
        throw new Error('Invalid or expired session');
      }
      
      const { session } = connections.get(sessionId);
      
      // Build SET clause from input
      const setClause = Object.entries(input)
        .map(([key, value]) => {
          // Convert camelCase to snake_case for SQL
          const sqlField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          
          // Handle string vs numeric values
          const sqlValue = typeof value === 'string' 
            ? `'${value}'` 
            : value;
            
          return `${sqlField} = ${sqlValue}`;
        })
        .join(', ');
      
      // Update query
      const query = `
        UPDATE budget_entries
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP()
        WHERE id = '${id}'
        RETURNING *
      `;
      
      // Execute update
      const operation = await session.executeStatement(query);
      const results = await operation.fetchAll();
      await operation.close();
      
      // Return the updated entry (with camelCase keys)
      if (results && results.length > 0) {
        const entry = results[0];
        return {
          id: entry.id,
          glAccount: entry.gl_account,
          projectId: entry.project_id,
          fiscalYear: entry.fiscal_year,
          fiscalMonth: entry.fiscal_month,
          amount: entry.amount,
          notes: entry.notes,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at
        };
      }
      
      throw new Error('Budget entry not found or update failed');
    }
  }
};
```

## Complete Schema Implementation

To extend the current implementation and add mutations for budget entries, add these types to your schema:

```graphql
# Input types for mutations
input BudgetEntryInput {
  glAccount: String
  projectId: String
  fiscalYear: Int
  fiscalMonth: Int
  amount: Float
  notes: String
}

input BudgetEntryUpdateInput {
  fiscalYear: Int
  fiscalMonth: Int
  amount: Float
  notes: String
}

# Add these to the existing schema
type Mutation {
  createBudgetEntry(sessionId: String!, input: BudgetEntryInput!): BudgetEntry
  updateBudgetEntry(sessionId: String!, id: ID!, input: BudgetEntryUpdateInput!): BudgetEntry
  deleteBudgetEntry(sessionId: String!, id: ID!): Boolean
}

# Enhance the BudgetEntry type with relationships
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
  
  # Related data
  project: Project
  glAccountDetails: GLAccount
}
```

## Developer Tools for GraphQL

For a visual experience when working with GraphQL:

1. **GraphiQL/Apollo Explorer**:
   - Interactive query builder
   - Schema documentation browser
   - Live query testing

2. **GraphQL Playground**:
   - Test mutations
   - View query history
   - Export queries as curl commands

3. **Visual Studio Code Extensions**:
   - GraphQL syntax highlighting
   - Schema validation
   - IntelliSense for queries

## Next Steps

1. Set up GraphiQL for your team to visually explore the API
2. Implement the mutation resolvers for budget entries
3. Extend the schema with useful relationships
4. Add custom measures for financial reporting
5. Create example queries in documentation 