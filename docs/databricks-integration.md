# Databricks/Fabric Integration Guide

## Overview

Budget Pro integrates with Microsoft Fabric/Databricks to provide real-time financial analytics and data processing capabilities. This integration uses Microsoft SSO for seamless authentication and Databricks SQL endpoints for data access.

## Authentication Flow

### 1. Microsoft SSO Setup

The application uses MSAL (Microsoft Authentication Library) with the following scopes:

```typescript
const scopes = [
  'User.Read',
  'https://analysis.windows.net/powerbi/api/Workspace.Read.All',
  'https://database.windows.net/sql/Data.Read',
  'https://database.windows.net/sql/Data.Write',
  'https://databricks.azure.com/user_impersonation',
  'https://databricks.azure.com/.default'
];
```

### 2. Token Management

- Tokens are acquired silently when possible
- Interactive authentication is triggered when necessary
- Automatic token refresh is handled by MSAL
- Separate tokens for Databricks and general API access

## Configuration

### Required Environment Variables

```env
VITE_AZURE_CLIENT_ID=your_client_id
VITE_AZURE_TENANT_ID=your_tenant_id
VITE_API_URL=your_api_url
```

### Databricks Workspace Configuration

Required parameters in the application:

- Workspace URL
- Catalog Name
- Schema (optional, defaults to 'default')

## Data Integration

### KPI Data Structure

```sql
-- Example KPI View Structure
CREATE VIEW kpi_view AS
SELECT
  metric_id,
  metric_name,
  current_value,
  target_value,
  trend_direction,
  last_updated
FROM financial_metrics;
```

### Transaction Data

```sql
-- Example Transaction Query
SELECT
  transaction_id,
  amount,
  category,
  gl_account,
  transaction_date,
  status
FROM transactions
WHERE date_range BETWEEN :start_date AND :end_date;
```

### Budget Data

```sql
-- Example Budget Query
SELECT
  budget_id,
  department,
  allocated_amount,
  spent_amount,
  fiscal_year,
  quarter
FROM budget_allocations
WHERE fiscal_year = :current_year;
```

## Error Handling

### Connection Issues

1. Token Expiration
   ```typescript
   try {
     const token = await getDatabricksToken();
   } catch (error) {
     // Handle token refresh
   }
   ```

2. Network Errors
   ```typescript
   try {
     const response = await fetch(endpoint);
   } catch (error) {
     // Implement retry logic
   }
   ```

### Data Validation

- Schema validation for incoming data
- Type checking for all fields
- Null value handling
- Date format standardization

## Performance Optimization

### Query Optimization

1. Use appropriate indexes
2. Implement query caching
3. Limit result sets
4. Use efficient join strategies

### Connection Pooling

- Maintain connection pool
- Implement connection timeout
- Handle connection recycling

## Security Considerations

### Data Access

- Role-based access control
- Row-level security
- Column-level security
- Audit logging

### Token Security

- Secure token storage
- Regular token rotation
- Token scope limitations
- Token validation

## Monitoring and Logging

### Metrics to Monitor

- Query performance
- Error rates
- Token refresh rates
- Data sync status

### Logging Strategy

```typescript
// Example logging implementation
const logDatabricksOperation = async (
  operation: string,
  status: 'success' | 'error',
  details: any
) => {
  await logger.log({
    timestamp: new Date(),
    operation,
    status,
    details,
    user: currentUser,
    workspace: databricksConfig.workspaceUrl
  });
};
```

## Troubleshooting Guide

### Common Issues

1. Authentication Failures
   - Check token validity
   - Verify scope configuration
   - Confirm Azure AD settings

2. Query Failures
   - Validate SQL syntax
   - Check permissions
   - Verify schema names

3. Performance Issues
   - Monitor query execution plans
   - Check data volume
   - Verify index usage

### Diagnostic Tools

- Network request monitoring
- Query performance analysis
- Token validation tools
- Log analysis

## Best Practices

1. Data Access
   - Use prepared statements
   - Implement query timeouts
   - Handle large result sets

2. Error Handling
   - Implement retry logic
   - Log detailed error information
   - Provide user-friendly error messages

3. Security
   - Regular security audits
   - Token lifecycle management
   - Access review procedures

## Development Workflow

### Local Development

1. Set up local environment:
   ```bash
   # Set development variables
   export VITE_SKIP_AUTH=true
   export VITE_MOCK_DATA=true
   ```

2. Use mock data:
   ```typescript
   const useMockData = import.meta.env.VITE_MOCK_DATA === 'true';
   const data = useMockData ? mockResponse : await fetchFromDatabricks();
   ```

### Testing

1. Unit Tests
   - Test token management
   - Validate query building
   - Check error handling

2. Integration Tests
   - Test connection flow
   - Verify data synchronization
   - Validate security measures

## Deployment Considerations

1. Environment Configuration
   - Set up production variables
   - Configure security settings
   - Enable monitoring

2. Performance Tuning
   - Optimize query performance
   - Configure connection pools
   - Set up caching

3. Monitoring Setup
   - Configure alerts
   - Set up logging
   - Enable performance monitoring 