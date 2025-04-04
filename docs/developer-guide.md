# Budget Pro Developer Guide

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **Routing**: React Router
- **Charts**: Recharts
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Build Tool**: Vite

### Backend Integration
- **Data Platform**: Microsoft Fabric/Databricks
- **API Layer**: Databricks SQL Endpoints
- **Authentication**: Azure AD / Microsoft SSO

## Project Structure

```
budgeting_app/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── charts/        # Chart components
│   │   ├── layout/        # Layout components
│   │   └── settings/      # Settings components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and service layers
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── docs/                  # Documentation
└── public/               # Static assets
```

## Component Architecture

### Core Components

#### Layout Component
- Manages the application's overall structure
- Handles responsive sidebar and main content area
- Implements navigation and routing

#### Dashboard Component
- Displays KPI cards and charts
- Manages data fetching and updates
- Implements responsive grid layout

#### Settings Components
- Handles application configuration
- Manages Databricks connection settings
- Implements form validation

### State Management

We use React Context API for state management:
- AuthContext: Manages authentication state
- ThemeContext: Handles theme preferences
- DataContext: Manages global data state

## Authentication Flow

1. **Initial Load**
   ```typescript
   // Initialize MSAL instance
   const msalInstance = new PublicClientApplication(msalConfig);
   
   // Handle redirect promise
   msalInstance.handleRedirectPromise().then(handleResponse);
   ```

2. **Login Process**
   ```typescript
   // Trigger login
   const login = async () => {
     try {
       await msalInstance.loginRedirect(loginRequest);
     } catch (error) {
       console.error('Login failed:', error);
     }
   };
   ```

3. **Token Management**
   ```typescript
   // Acquire token
   const getToken = async () => {
     const account = msalInstance.getActiveAccount();
     const response = await msalInstance.acquireTokenSilent({
       ...tokenRequest,
       account
     });
     return response.accessToken;
   };
   ```

## Data Integration

### Databricks Connection

1. **Configuration**
   ```typescript
   interface DatabricksConfig {
     workspaceUrl: string;
     catalog: string;
     schema: string;
   }
   ```

2. **Query Execution**
   ```typescript
   const executeQuery = async (query: string) => {
     const token = await getToken();
     return await databricksClient.sql.execute(query, token);
   };
   ```

### Data Models

#### Budget Data
```typescript
interface Budget {
  id: string;
  name: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  category: string;
  department: string;
}
```

#### Transaction Data
```typescript
interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  glAccount: string;
}
```

## Error Handling

### Global Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, errorInfo);
    // Show fallback UI
  }
}
```

### API Error Handling
```typescript
const handleApiError = (error: unknown) => {
  if (error instanceof DatabricksError) {
    // Handle Databricks specific errors
  } else if (error instanceof AuthError) {
    // Handle authentication errors
  } else {
    // Handle generic errors
  }
};
```

## Performance Optimization

### React Optimization

1. **Memoization**
   ```typescript
   const MemoizedComponent = React.memo(({ data }) => {
     // Component logic
   });
   ```

2. **Code Splitting**
   ```typescript
   const LazyComponent = React.lazy(() => import('./Component'));
   ```

### Data Optimization

1. **Query Optimization**
   - Use appropriate indexes
   - Limit result sets
   - Implement pagination

2. **Caching Strategy**
   ```typescript
   const useDataCache = (key: string) => {
     const [data, setData] = useState(null);
     // Cache implementation
   };
   ```

## Testing

### Unit Tests
```typescript
describe('Component Tests', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
describe('Integration Tests', () => {
  it('should handle data flow', async () => {
    // Test data flow between components
  });
});
```

## Deployment

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Configuration
```env
VITE_AZURE_CLIENT_ID=your_client_id
VITE_AZURE_TENANT_ID=your_tenant_id
VITE_API_URL=your_api_url
```

## Best Practices

### Code Style
- Follow TypeScript best practices
- Use consistent naming conventions
- Implement proper error handling
- Write comprehensive documentation

### Component Guidelines
- Keep components focused and single-responsibility
- Implement proper prop validation
- Use TypeScript interfaces for props
- Maintain consistent file structure

### Performance Guidelines
- Implement proper memoization
- Use React.lazy for code splitting
- Optimize re-renders
- Monitor bundle size

## Troubleshooting

### Common Development Issues

1. **Build Errors**
   - Check TypeScript configurations
   - Verify dependencies
   - Review import statements

2. **Authentication Issues**
   - Verify Azure AD configurations
   - Check token expiration
   - Review CORS settings

3. **Data Integration Issues**
   - Validate Databricks connection
   - Check query syntax
   - Verify permissions

## Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Write tests
4. Submit pull request
5. Review and merge

### Code Review Guidelines
- Check for TypeScript errors
- Verify test coverage
- Review performance impact
- Ensure documentation updates

## Security

### Authentication
- Implement proper token handling
- Use secure storage methods
- Follow OAuth 2.0 best practices

### Data Security
- Validate input data
- Implement proper access controls
- Use secure communication channels

## Monitoring

### Error Tracking
```typescript
const logError = (error: Error, context?: any) => {
  // Implementation of error logging
};
```

### Performance Monitoring
```typescript
const measurePerformance = (component: string) => {
  // Implementation of performance tracking
};
```

## Support

For development support:
- GitHub Issues
- Development Team Channel
- Technical Documentation

## Version Control

### Branch Strategy
- main: Production code
- develop: Development branch
- feature/*: Feature branches
- hotfix/*: Hot fix branches

### Release Process
1. Version bump
2. Change log update
3. Tag release
4. Deploy to staging
5. Deploy to production 