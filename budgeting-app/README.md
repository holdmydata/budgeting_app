# Budgeting App

A modern budgeting application with Databricks integration using a server-middleware architecture.

## Project Structure

- `src/` - Frontend React application
- `server/` - Express.js server for Databricks connections
- `electron/` - Electron configuration for desktop app

## Features

- Modern React frontend with Material UI
- Server-middleware architecture for secure Databricks connections
- REST API endpoints for data access
- - GraphQL API for all major entities (Projects, Vendors, Transactions, Budget Entries) in Databricks mode
- Mock data support for development and demos
- Electron compatibility for desktop application

## Setup

### Prerequisites

- Node.js 18+ and npm
- Databricks workspace (for production use)

### Installation

1. Install frontend dependencies:

```bash
cd budgeting-app
npm install
```

2. Install server dependencies:

```bash
cd server
npm install
```

## Running the Application

### Development Mode

To run both the frontend and server concurrently:

```bash
npm run start
```

This will start:
- Frontend dev server at http://localhost:5173
- Express server at http://localhost:5000

### Running the Frontend Only

```bash
npm run dev
```

### Running the Server Only

```bash
npm run server
```

## GraphQL API

When using Databricks as your data source, the app uses a modern GraphQL API for all data operations.  
The GraphQL endpoint is available at:

```
http://localhost:5000/graphql
```

You can use tools like [Apollo Studio](https://studio.apollographql.com/) or [GraphiQL](https://github.com/graphql/graphiql) to explore the schema and run queries/mutations.

#### Example Query

```graphql
query {
  projects(sessionId: "YOUR_SESSION_ID") {
    id
    projectName
    budget
    status
  }
}
```

#### Example Mutation

```graphql
mutation {
  addVendor(
    sessionId: "YOUR_SESSION_ID",
    input: {
      vendorName: "Acme Corp"
      vendorCode: "ACME"
      category: "Supplies"
      isActive: true
    }
  ) {
    id
    vendorName
    createdAt
  }
}
```

> **Note:** REST endpoints are still available for legacy/API mode, but Databricks mode is GraphQL-first.

## Databricks Configuration

When using the application with Databricks:

1. Navigate to the Data Source Configuration screen
2. Select "Databricks SQL" as the data source type
3. Enter your Databricks workspace information:
   - Workspace URL
   - HTTP Path
   - Warehouse ID
   - Catalog Name (optional)
   - Schema Name (optional)
   - API Key

The application securely connects to Databricks through the server middleware, eliminating browser compatibility issues.

## Using Mock Data

For development or demo purposes, you can use mock data:

1. Navigate to the Data Source Configuration screen
2. Select "Mock Data" as the data source type
3. Configure the simulated network delay if desired

## Environment Variables

Create a `.env` file in the server directory with the following variables (optional):

```
PORT=5000
```

## Building for Production

To build the frontend for production:

```bash
npm run build
```

To build the Electron desktop app:

```bash
npm run electron:build
```

## Data Source Configuration

The application supports multiple data sources:

1. **Mock Data**: Uses built-in mock data for demonstration purposes
2. **Databricks SQL**: Connects to a Databricks SQL endpoint
3. **REST API**: Connects to a custom REST API backend

### Configuring Data Sources

1. Navigate to "Data Source" in the navigation menu
2. Select the desired data source type
3. Enter the required configuration details
4. Click "Save Configuration" to apply changes

### Databricks SQL Configuration

To connect to Databricks, you'll need:

- Workspace URL (e.g., `https://adb-xxx.azuredatabricks.net`)
- SQL Warehouse ID
- HTTP Path (e.g., `/sql/1.0/warehouses/xxx`)
- Catalog name (e.g., `main`)
- Schema name (e.g., `default`)
- (Optional) Personal Access Token

### Database Setup

For Databricks SQL users, a setup script is provided in `src/utils/database-setup.sql`. This script:

1. Creates the necessary tables and views
2. Sets up sample data
3. Can be customized for your specific catalog/schema

To use the script:

1. Replace the `${catalog}` and `${schema}` placeholders with your values
2. Execute the script in your Databricks SQL workspace

## Known Issues

- The Buffer polyfill may have compatibility issues with some browser environments. If you encounter `Buffer is not defined` errors, ensure the polyfills.ts file is properly imported in your application.

## Development

### Project Structure

- `src/components` - Reusable UI components
- `src/pages` - Main application pages
- `src/services` - Data and API services
- `src/context` - React context providers
- `src/types` - TypeScript type definitions
- `src/utils` - Utility functions and helpers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by Hold My Data & Claude AI
