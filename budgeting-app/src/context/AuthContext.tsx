import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import * as microsoftTeams from '@microsoft/teams-js';
import { useNavigate } from 'react-router-dom';

// Always skip auth for now to troubleshoot UI issues
const skipAuth = true; // Force skip auth until we resolve UI issues

// MSAL configuration for Azure AD
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  },
};

// Required scopes for the application
const loginRequest = {
  scopes: [
    'User.Read',
    'https://analysis.windows.net/powerbi/api/Workspace.Read.All',
    'https://database.windows.net/sql/Data.Read',
    'https://database.windows.net/sql/Data.Write'
  ]
};

// Additional scopes for Databricks/Fabric
const databricksRequest = {
  scopes: [
    ...loginRequest.scopes,
    'https://databricks.azure.com/user_impersonation',
    'https://databricks.azure.com/.default'
  ]
};

interface AuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AccountInfo | null;
  error: Error | null;
  inTeamsContext: boolean;
  login: () => Promise<void>;
  logout: () => void;
  acquireToken: (resource?: string) => Promise<string | null>;
  getDatabricksToken: () => Promise<string | null>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isInitializing: true,
  user: null,
  error: null,
  inTeamsContext: false,
  login: async () => {},
  logout: () => {},
  acquireToken: async () => null,
  getDatabricksToken: async () => null,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [inTeamsContext, setInTeamsContext] = useState(false);
  const navigate = useNavigate();

  const msalInstance = new PublicClientApplication(msalConfig);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (skipAuth) {
          setIsAuthenticated(true);
          setIsInitializing(false);
          return;
        }

        // Check if we're in Teams
        try {
          await microsoftTeams.initialize();
          setInTeamsContext(true);
          await handleTeamsAuth();
        } catch (teamsError) {
          // Not in Teams context or Teams initialization failed
          await handleRegularAuth();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const handleTeamsAuth = async () => {
    try {
      const authTokenRequest = {
        successCallback: (result: string) => {
          console.log('Teams auth success:', result);
          setIsAuthenticated(true);
          setIsInitializing(false);
        },
        failureCallback: (error: string) => {
          console.error('Teams auth failed:', error);
          setError(new Error(error));
          setIsInitializing(false);
        },
      };

      await microsoftTeams.authentication.getAuthToken(authTokenRequest);
    } catch (error) {
      console.error('Teams auth error:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      setIsInitializing(false);
    }
  };

  const handleRegularAuth = async () => {
    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setUser(accounts[0]);
        setIsAuthenticated(true);
      }
      setIsInitializing(false);
    } catch (error) {
      console.error('Regular auth error:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      setIsInitializing(false);
    }
  };

  const login = async () => {
    try {
      if (inTeamsContext) {
        await handleTeamsAuth();
      } else {
        const result = await msalInstance.loginPopup(loginRequest);
        setUser(result.account);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  const logout = () => {
    try {
      if (inTeamsContext) {
        // In Teams, just clear the state
        setUser(null);
        setIsAuthenticated(false);
      } else {
        msalInstance.logout();
      }
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  const acquireToken = async (resource?: string): Promise<string | null> => {
    try {
      const account = msalInstance.getAllAccounts()[0];
      if (!account) return null;

      const request = {
        ...loginRequest,
        account,
        scopes: resource ? [resource] : loginRequest.scopes,
      };

      const result = await msalInstance.acquireTokenSilent(request);
      return result.accessToken;
    } catch (error) {
      console.error('Token acquisition failed:', error);
      return null;
    }
  };

  const getDatabricksToken = async (): Promise<string | null> => {
    try {
      const account = msalInstance.getAllAccounts()[0];
      if (!account) return null;

      const result = await msalInstance.acquireTokenSilent({
        ...databricksRequest,
        account,
      });

      return result.accessToken;
    } catch (error) {
      console.error('Databricks token acquisition failed:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitializing,
        user,
        error,
        inTeamsContext,
        login,
        logout,
        acquireToken,
        getDatabricksToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 