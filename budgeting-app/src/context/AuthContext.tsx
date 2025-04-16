import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import * as microsoftTeams from '@microsoft/teams-js';
import { useNavigate } from 'react-router-dom';

// Always skip auth for now to troubleshoot UI issues
const skipAuth = false; // Enabling auth to get data access

// MSAL configuration for Azure AD
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true,
  }
};

// Required scopes for the application
const loginRequest = {
  scopes: [
    'User.Read',
    'https://database.windows.net/sql/Data.Read',
    'https://database.windows.net/sql/Data.Write',
    'https://databricks.azure.com/user_impersonation'
  ]
};

// Fabric/Databricks configuration
const fabricConfig = {
  catalog: import.meta.env.VITE_FABRIC_CATALOG,
  schema: import.meta.env.VITE_FABRIC_SCHEMA
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

// Initialize MSAL instance outside of component
const msalInstance = new PublicClientApplication(msalConfig);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [inTeamsContext, setInTeamsContext] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (skipAuth) {
          setIsAuthenticated(true);
          setIsInitializing(false);
          return;
        }

        // Check for existing accounts
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setUser(accounts[0]);
          setIsAuthenticated(true);
          setIsInitializing(false);
          return;
        }

        // Try silent token acquisition
        try {
          const silentResult = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
          });
          setUser(silentResult.account);
          setIsAuthenticated(true);
        } catch (e) {
          // Fall back to interactive method
          try {
            const loginResult = await msalInstance.loginPopup(loginRequest);
            setUser(loginResult.account);
            setIsAuthenticated(true);
          } catch (popupError) {
            console.error('Interactive login failed:', popupError);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async () => {
    try {
      const loginResult = await msalInstance.loginPopup(loginRequest);
      setUser(loginResult.account);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  const logout = () => {
    try {
      msalInstance.logout();
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

      const tokenRequest = {
        scopes: resource ? [resource] : loginRequest.scopes,
        account: account
      };

      try {
        const response = await msalInstance.acquireTokenSilent(tokenRequest);
        return response.accessToken;
      } catch (e) {
        // If silent token acquisition fails, try interactive
        const response = await msalInstance.loginPopup(tokenRequest);
        return response.accessToken;
      }
    } catch (error) {
      console.error('Token acquisition failed:', error);
      return null;
    }
  };

  const getDatabricksToken = async (): Promise<string | null> => {
    return acquireToken('https://databricks.azure.com/user_impersonation');
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