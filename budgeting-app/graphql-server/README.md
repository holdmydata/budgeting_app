# Financial Transactions GraphQL API

A GraphQL API for managing financial transaction data with support for querying transactions, accounts, and budget entries.

## Features

- **Transaction Queries**: Fetch transaction data with filtering options
- **Account Management**: Query account information and balances
- **Period Summaries**: Get financial data summarized by period (monthly, quarterly, yearly)
- **Running Balances**: Calculate running balances for accounts
- **Budget Tracking**: Create, update, and delete budget entries

## Schema

The GraphQL schema includes the following main types:

- `Transaction`: Represents a financial transaction
- `Account`: Represents a financial account with transactions
- `PeriodSummary`: Summarizes financial data for a specific period
- `BudgetEntry`: Represents a budget allocation for a specific account and period

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in a `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=financial_db
```

3. Run database migrations:

```bash
npx knex migrate:latest
```

4. Start the server:

```bash
npm run dev
```

The GraphQL API will be available at `http://localhost:4000`

## Database Schema

The implementation works with the following core database schema:

```
Transactions Table:
- transactionID (string, composite key)
- RECID (string)
- trans_date_id (string in format YYYYMMDD)
- doc_date_id (string in format YYYYMMDD)
- accountnum (string)
- journalnum (string)
- voucher (string)
- transdate (date)
- documentdate (date)
- txt (description text)
- amountcur (numeric)
- debit_credit_flag (indicates debit/credit)
```

## Example Queries

See `example-queries.graphql` for sample queries that demonstrate the API's capabilities.

## Data Sources

The API uses the following data sources:

- `TransactionsAPI`: For transaction-related queries
- `AccountsAPI`: For account-related queries
- `BudgetAPI`: For budget entry management

## Computed Fields

The API includes several computed fields:

- `runningBalance`: Calculates the running balance for an account up to a specific transaction
- `accountStatus`: Determines account status based on balance and transaction history
- `periodSummaries`: Summarizes financial data by period (monthly, quarterly, yearly)

## License

MIT 