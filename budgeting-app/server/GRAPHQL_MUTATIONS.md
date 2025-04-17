# GraphQL Mutations for Budget Lines

This guide shows how to implement and use GraphQL mutations to update budget data in our application.

## Mutation Flow Diagram

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│     UI Form       │     │  GraphQL Mutation │     │   Database        │
│                   │────►│                   │────►│                   │
│ Budget Entry Form │     │ updateBudgetEntry │     │ budget_entries    │
└───────────────────┘     └───────────────────┘     └───────────────────┘
                                    │
                                    │
                                    ▼
                          ┌───────────────────┐
                          │ Response:         │
                          │ Updated entry     │
                          │ with new values   │
                          └───────────────────┘
```

## Schema Implementation for Mutations

First, add these types to your GraphQL schema:

```graphql
# Input types for create/update operations
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

# Mutation type with budget operations
type Mutation {
  createBudgetEntry(
    sessionId: String!, 
    input: BudgetEntryInput!
  ): BudgetEntry
  
  updateBudgetEntry(
    sessionId: String!, 
    id: ID!, 
    input: BudgetEntryUpdateInput!
  ): BudgetEntry
  
  deleteBudgetEntry(
    sessionId: String!, 
    id: ID!
  ): DeleteResponse
}

# Simple response for delete operations
type DeleteResponse {
  success: Boolean!
  message: String
}
```

## Server Implementation

Add these resolvers to your server:

```javascript
// In your resolvers.js file
const Mutation = {
  // Create new budget entry
  createBudgetEntry: async (_, { sessionId, input }, context) => {
    if (!sessionId || !connections.has(sessionId)) {
      throw new Error('Invalid or expired session');
    }
    
    const { session } = connections.get(sessionId);
    
    // Convert input from camelCase to snake_case for SQL
    const columns = Object.keys(input).map(key => 
      key.replace(/([A-Z])/g, '_$1').toLowerCase()
    ).join(', ');
    
    const values = Object.values(input).map(value => 
      typeof value === 'string' ? `'${value}'` : value
    ).join(', ');
    
    const query = `
      INSERT INTO budget_entries (${columns}, created_at, updated_at)
      VALUES (${values}, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())
      RETURNING *
    `;
    
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
    if (results && results.length > 0) {
      // Convert snake_case back to camelCase for response
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
    
    throw new Error('Failed to create budget entry');
  },
  
  // Update existing budget entry
  updateBudgetEntry: async (_, { sessionId, id, input }, context) => {
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
    
    const query = `
      UPDATE budget_entries
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP()
      WHERE id = '${id}'
      RETURNING *
    `;
    
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
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
  },
  
  // Delete budget entry
  deleteBudgetEntry: async (_, { sessionId, id }, context) => {
    if (!sessionId || !connections.has(sessionId)) {
      throw new Error('Invalid or expired session');
    }
    
    const { session } = connections.get(sessionId);
    
    const query = `
      DELETE FROM budget_entries
      WHERE id = '${id}'
      RETURNING id
    `;
    
    const operation = await session.executeStatement(query);
    const results = await operation.fetchAll();
    await operation.close();
    
    if (results && results.length > 0) {
      return {
        success: true,
        message: `Budget entry ${id} deleted successfully`
      };
    }
    
    return {
      success: false,
      message: 'Budget entry not found or already deleted'
    };
  }
};
```

Then add the resolver to your Apollo Server configuration:

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: { /* existing query resolvers */ },
    Mutation, // Add the mutation resolvers
    // Other resolvers...
  },
});
```

## Client-Side Implementation

### Create Form

```jsx
import { useMutation, gql } from '@apollo/client';

// Mutation definition
const CREATE_BUDGET_ENTRY = gql`
  mutation CreateBudgetEntry($sessionId: String!, $input: BudgetEntryInput!) {
    createBudgetEntry(sessionId: $sessionId, input: $input) {
      id
      glAccount
      projectId
      fiscalYear
      fiscalMonth
      amount
      notes
    }
  }
`;

function BudgetEntryForm({ sessionId }) {
  const [createEntry, { loading }] = useMutation(CREATE_BUDGET_ENTRY);
  
  const handleSubmit = async (formData) => {
    try {
      const result = await createEntry({
        variables: {
          sessionId,
          input: {
            glAccount: formData.glAccount,
            projectId: formData.projectId,
            fiscalYear: parseInt(formData.fiscalYear),
            fiscalMonth: parseInt(formData.fiscalMonth),
            amount: parseFloat(formData.amount),
            notes: formData.notes
          }
        }
      });
      
      // Handle success - show notification, reset form, etc.
      console.log('Created entry:', result.data.createBudgetEntry);
      
    } catch (error) {
      // Handle error
      console.error('Error creating budget entry:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields for GL account, project, year, month, amount, notes */}
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Budget Entry'}
      </button>
    </form>
  );
}
```

### Update Form

```jsx
import { useMutation, gql } from '@apollo/client';

const UPDATE_BUDGET_ENTRY = gql`
  mutation UpdateBudgetEntry($sessionId: String!, $id: ID!, $input: BudgetEntryUpdateInput!) {
    updateBudgetEntry(sessionId: $sessionId, id: $id, input: $input) {
      id
      amount
      notes
      updatedAt
    }
  }
`;

function EditBudgetEntryForm({ sessionId, entryId, initialData }) {
  const [updateEntry, { loading }] = useMutation(UPDATE_BUDGET_ENTRY);
  
  const handleSubmit = async (formData) => {
    try {
      const result = await updateEntry({
        variables: {
          sessionId,
          id: entryId,
          input: {
            amount: parseFloat(formData.amount),
            notes: formData.notes
          }
        }
      });
      
      // Handle success
      console.log('Updated entry:', result.data.updateBudgetEntry);
      
    } catch (error) {
      // Handle error
      console.error('Error updating budget entry:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields pre-populated with initialData */}
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Budget Entry'}
      </button>
    </form>
  );
}
```

### Delete Operation

```jsx
import { useMutation, gql } from '@apollo/client';

const DELETE_BUDGET_ENTRY = gql`
  mutation DeleteBudgetEntry($sessionId: String!, $id: ID!) {
    deleteBudgetEntry(sessionId: $sessionId, id: $id) {
      success
      message
    }
  }
`;

function DeleteBudgetEntryButton({ sessionId, entryId, onSuccess }) {
  const [deleteEntry, { loading }] = useMutation(DELETE_BUDGET_ENTRY);
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this budget entry?')) {
      try {
        const result = await deleteEntry({
          variables: {
            sessionId,
            id: entryId
          }
        });
        
        if (result.data.deleteBudgetEntry.success) {
          // Handle successful deletion
          onSuccess();
        } else {
          // Handle failed deletion
          alert(result.data.deleteBudgetEntry.message);
        }
        
      } catch (error) {
        // Handle error
        console.error('Error deleting budget entry:', error);
        alert('Failed to delete budget entry');
      }
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## Complete Budget Lines CRUD UI

Here's a complete example of a budget lines management table with CRUD functionality:

```jsx
import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from 'react';

// Query to get budget entries
const GET_BUDGET_ENTRIES = gql`
  query GetBudgetEntries($sessionId: String!, $fiscalYear: Int) {
    budgetEntries(sessionId: $sessionId, fiscalYear: $fiscalYear) {
      id
      glAccount
      projectId
      fiscalYear
      fiscalMonth
      amount
      notes
      createdAt
      updatedAt
      
      # Include related data for display
      project {
        projectName
      }
      glAccountDetails {
        accountName
      }
    }
  }
`;

// Mutations defined above

function BudgetLinesManager({ sessionId }) {
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Fetch budget entries
  const { loading, error, data, refetch } = useQuery(GET_BUDGET_ENTRIES, {
    variables: { sessionId, fiscalYear }
  });
  
  // Setup mutations
  const [createEntry] = useMutation(CREATE_BUDGET_ENTRY, {
    onCompleted: () => refetch()
  });
  
  const [updateEntry] = useMutation(UPDATE_BUDGET_ENTRY, {
    onCompleted: () => {
      refetch();
      setEditingEntry(null);
    }
  });
  
  const [deleteEntry] = useMutation(DELETE_BUDGET_ENTRY, {
    onCompleted: () => refetch()
  });
  
  // CRUD handlers
  const handleCreate = (formData) => {
    createEntry({
      variables: {
        sessionId,
        input: {
          glAccount: formData.glAccount,
          projectId: formData.projectId,
          fiscalYear: parseInt(fiscalYear),
          fiscalMonth: parseInt(formData.fiscalMonth),
          amount: parseFloat(formData.amount),
          notes: formData.notes
        }
      }
    });
  };
  
  const handleUpdate = (formData) => {
    updateEntry({
      variables: {
        sessionId,
        id: editingEntry.id,
        input: {
          amount: parseFloat(formData.amount),
          notes: formData.notes
        }
      }
    });
  };
  
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this budget entry?')) {
      deleteEntry({
        variables: { sessionId, id }
      });
    }
  };
  
  if (loading) return <p>Loading budget entries...</p>;
  if (error) return <p>Error loading budget entries: {error.message}</p>;
  
  return (
    <div className="budget-lines-manager">
      <h2>Budget Lines for {fiscalYear}</h2>
      
      {/* Year selector */}
      <div className="year-selector">
        <label>Fiscal Year:</label>
        <select 
          value={fiscalYear} 
          onChange={(e) => setFiscalYear(parseInt(e.target.value))}
        >
          {[2022, 2023, 2024, 2025].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      {/* Budget entries table */}
      <table className="budget-entries-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>GL Account</th>
            <th>Project</th>
            <th>Amount</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.budgetEntries.map(entry => (
            <tr key={entry.id}>
              <td>{getMonthName(entry.fiscalMonth)}</td>
              <td>{entry.glAccountDetails?.accountName || entry.glAccount}</td>
              <td>{entry.project?.projectName || entry.projectId}</td>
              <td>${entry.amount.toLocaleString()}</td>
              <td>{entry.notes}</td>
              <td>
                <button onClick={() => setEditingEntry(entry)}>Edit</button>
                <button onClick={() => handleDelete(entry.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Add new entry button */}
      <button onClick={() => setEditingEntry({})}>Add New Budget Entry</button>
      
      {/* Edit/Create form modal */}
      {editingEntry && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingEntry.id ? 'Edit Budget Entry' : 'Create Budget Entry'}</h3>
            <form onSubmit={editingEntry.id ? handleUpdate : handleCreate}>
              {/* Form fields */}
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingEntry(null)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get month name
function getMonthName(monthNum) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNum - 1];
}
```

## Visual Workflow: Mutation to Database Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GRAPHQL MUTATION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

 ┌───────────┐      ┌────────────┐      ┌───────────┐      ┌────────────┐ 
 │   React   │      │   Apollo   │      │  GraphQL  │      │ Databricks │ 
 │   Form    │─────►│   Client   │─────►│  Server   │─────►│    SQL     │ 
 └───────────┘      └────────────┘      └───────────┘      └────────────┘ 
       │                  │                   │                  │         
       │                  │                   │                  │         
       │                  │                   │                  │         
       ▼                  ▼                   ▼                  ▼         
 ┌───────────┐      ┌────────────┐      ┌───────────┐      ┌────────────┐ 
 │ User      │      │ Mutation   │      │ Resolver  │      │ SQL Update │ 
 │ submits   │──┬──►│ request    │──┬──►│ processes │──┬──►│ executed   │ 
 │ data      │  │   │ formed     │  │   │ request   │  │   │ in DB      │ 
 └───────────┘  │   └────────────┘  │   └───────────┘  │   └────────────┘ 
                │                   │                  │                  
                │                   │                  │                  
                │                   │                  │                  
                ▼                   ▼                  ▼                  
          ┌───────────┐      ┌────────────┐     ┌────────────┐           
          │ Validates │      │ Sends to   │     │ Returns    │           
          │ user      │      │ GraphQL    │     │ endpoint   │           
          │ input     │      │ endpoint   │     │ to client  │           
          └───────────┘      └────────────┘     └────────────┘           
                                   │                  ▲                  
                                   │                  │                  
                                   └──────────────────┘                  
                                                                         
```

## Making Budget Lines Updates Simple

GraphQL makes updating budget lines simpler by:

1. **Validation at schema level** - Types ensure correct data format
2. **Single endpoint** - All CRUD operations through one GraphQL endpoint
3. **Precise updates** - Update only the fields that changed, not the whole record
4. **Immediate feedback** - Return exact updated fields to confirm changes
5. **Batch operations** - Can update multiple entries in a single mutation
6. **Transaction support** - All-or-nothing updates for data integrity 