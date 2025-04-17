# Server Implementation Documentation

This document outlines the technical implementation of the Express.js server that handles Databricks SQL connections and API endpoints for the budgeting application.

## Architecture Overview

The server implements the middleware architecture described in the README.md, providing:

1. Secure connections to Databricks SQL
2. REST API endpoints for data retrieval
3. GraphQL API for flexible data querying
4. Session management for database connections

## Server Configuration

The server uses the following configuration options:

- **Port**: Defaults to 5000, can be overridden with the `PORT` environment variable
- **Connection Timeout**: Defaults to 30 minutes (1,800,000ms), can be overridden with the `CONNECTION_TIMEOUT` environment variable
- **CORS**: Configurable via the `ALLOWED_ORIGINS` environment variable

## Connection Management

Database connections are managed through a session-based architecture:

1. When a client connects, a unique `sessionId` is generated
2. The connection and session are stored in a `connections` Map
3. Connections automatically close after the timeout period
4. Clients must include the `sessionId` in subsequent requests

## API Endpoints

### REST API Endpoints

#### Connection Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/databricks/connect` | POST | Establish a new Databricks connection | `{ workspaceUrl, httpPath, warehouseId, catalog, schema, apiKey }` | `{ success, message, sessionId }` |
| `/api/databricks/test` | POST | Test a Databricks connection | `{ workspaceUrl, httpPath, warehouseId, catalog, schema, apiKey }` | `{ success, message }` |
| `/api/databricks/disconnect` | POST | Close a Databricks connection | `{ sessionId }` | `{ success, message }` |
| `/api/databricks/query` | POST | Execute a custom SQL query | `{ sessionId, query }` | `{ success, data }` |

#### Data Retrieval Endpoints

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/api/kpis` | GET | `sessionId` | Retrieve KPI metrics |
| `/api/gl-accounts` | GET | `sessionId` + filters | Retrieve General Ledger accounts |
| `/api/projects` | GET | `sessionId` + filters | Retrieve projects data |
| `/api/transactions` | GET | `sessionId` + filters | Retrieve financial transactions |
| `/api/budget-entries` | GET | `sessionId` + filters | Retrieve budget entries |

#### Server Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Check server status and active connections |

### GraphQL API

The server also provides a GraphQL API endpoint at `/graphql` that allows for more flexible and efficient data fetching.

#### Schema Overview

The GraphQL schema includes the following types:

- `KPI`: Key performance indicators
- `GLAccount`: General ledger accounts
- `Project`: Project details and budget information
- `Transaction`: Financial transactions
- `BudgetEntry`: Budget allocation entries

#### Queries

All GraphQL queries require a valid `sessionId` parameter:

```graphql
# Get all KPIs
query {
  kpis(sessionId: "1234567890") {
    id
    title
    value
    formattedValue
    change
  }
}

# Get active GL accounts
query {
  glAccounts(sessionId: "1234567890", isActive: true) {
    id
    accountNumber
    accountName
    accountType
  }
}

# Get projects with specific status
query {
  projects(sessionId: "1234567890", status: "Active") {
    id
    projectName
    budget
    spent
    status
  }
}

# Get transactions for a specific project
query {
  transactions(sessionId: "1234567890", projectId: "PRJ-001") {
    id
    transactionDate
    amount
    description
  }
}

# Get budget entries for a specific year
query {
  budgetEntries(sessionId: "1234567890", fiscalYear: 2023) {
    id
    glAccount
    fiscalMonth
    amount
  }
}
```

## Using the API

### Connection Flow

1. **Establish Connection**:
   ```javascript
   // Connect to Databricks
   const response = await fetch('/api/databricks/connect', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       workspaceUrl: 'https://adb-xxx.azuredatabricks.net',
       httpPath: '/sql/1.0/warehouses/xxx',
       catalog: 'main',
       schema: 'default',
       apiKey: 'dapi123456789'
     })
   });
   const { sessionId } = await response.json();
   ```

2. **Make Data Requests using REST API**:
   ```javascript
   // Fetch projects
   const projects = await fetch(`/api/projects?sessionId=${sessionId}`);
   ```

3. **Make Data Requests using GraphQL**:
   ```javascript
   // Fetch projects and their transactions in a single query
   const response = await fetch('/graphql', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       query: `
         query {
           projects(sessionId: "${sessionId}", status: "Active") {
             id
             projectName
             budget
             spent
           }
           transactions(sessionId: "${sessionId}", projectId: "PRJ-001") {
             transactionDate
             amount
             description
           }
         }
       `
     })
   });
   const data = await response.json();
   ```

4. **Close Connection When Done**:
   ```javascript
   // Disconnect
   await fetch('/api/databricks/disconnect', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ sessionId })
   });
   ```

## Implementation Details

The server uses:
- `express` for HTTP routing and middleware
- `@databricks/sql` for Databricks SQL connections
- `@apollo/server` for GraphQL implementation
- `graphql` for schema definition
- `cors` for Cross-Origin Resource Sharing
- `dotenv` for environment variable management

## Error Handling

All API endpoints include consistent error handling:
- HTTP 400 for invalid requests
- HTTP 404 for invalid sessions
- HTTP 500 for server and database errors

Each error response follows the format:
```json
{
  "error": true,
  "message": "Error description"
}
```

GraphQL errors are returned in the standard GraphQL error format:
```json
{
  "errors": [
    {
      "message": "Error description",
      "locations": [...],
      "path": [...]
    }
  ]
}
```

## Alignment with README Features

The implementation aligns with the README.md description:
- ✅ Server-middleware architecture for Databricks connections
- ✅ REST API endpoints for data access
- ✅ GraphQL API for flexible data querying
- ✅ Support for different data sources (Databricks)
- ✅ Secure connection handling

## Future Enhancements

Potential server improvements to consider:
1. Add authentication/authorization
2. Implement connection pooling for better performance
3. Add GraphQL mutations for data manipulation
4. Expand GraphQL schema with more complex relationships
5. Implement caching mechanisms 
6. Add custom resolvers for computed fields and metrics
7. Implement real-time data updates using GraphQL subscriptions 