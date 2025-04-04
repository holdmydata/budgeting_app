// Type declarations for libraries without TypeScript declarations
declare module '@microsoft/teams-js' {
  export function initialize(): Promise<void>;
  export function getContext(callback: (context: any) => void): void;
  
  export namespace authentication {
    export function getAuthToken(options: {
      successCallback: (token: string) => void;
      failureCallback: (error: string) => void;
    }): void;
  }
}

declare module '@azure/msal-browser' {
  export class PublicClientApplication {
    constructor(config: any);
    getAllAccounts(): AccountInfo[];
    setActiveAccount(account: AccountInfo): void;
    getActiveAccount(): AccountInfo | null;
    loginPopup(options?: any): Promise<AuthenticationResult>;
    logout(): void;
    acquireTokenSilent(options: any): Promise<AuthenticationResult>;
  }

  export interface AccountInfo {
    name?: string;
    username: string;
    localAccountId: string;
    homeAccountId: string;
    tenantId: string;
    environment: string;
  }

  export interface AuthenticationResult {
    account: AccountInfo;
    accessToken: string;
    expiresOn: Date;
    scopes: string[];
    idToken: string;
    idTokenClaims: Record<string, any>;
    tenantId: string;
  }
}

declare module '@tanstack/react-query' {
  export interface QueryClientConfig {
    defaultOptions?: {
      queries?: {
        staleTime?: number;
        cacheTime?: number;
        retry?: number;
        refetchOnWindowFocus?: boolean;
      }
    }
  }

  export class QueryClient {
    constructor(config?: QueryClientConfig);
    invalidateQueries(queryKey: string[]): Promise<void>;
  }

  export function QueryClientProvider(props: { 
    client: QueryClient; 
    children: React.ReactNode 
  }): JSX.Element;
}

// For recharts types
declare module 'recharts' {
  import { ComponentType, ReactNode } from 'react';

  export interface BarProps {
    dataKey: string;
    fill?: string;
    name?: string;
    stackId?: string;
  }

  export interface PieProps {
    data: any[];
    cx?: string | number;
    cy?: string | number;
    labelLine?: boolean;
    label?: ((props: any) => string) | boolean;
    outerRadius?: number;
    fill?: string;
    dataKey: string;
    children?: ReactNode;
  }

  export interface CellProps {
    key: string;
    fill: string;
  }

  export interface ChartProps {
    data: any[];
    layout?: 'horizontal' | 'vertical';
    margin?: { top: number; right: number; bottom: number; left: number };
    children?: ReactNode;
  }

  export interface XAxisProps {
    dataKey?: string;
    type?: 'number' | 'category';
    tickFormatter?: (value: any) => string;
    width?: number;
  }

  export interface YAxisProps {
    dataKey?: string;
    type?: 'number' | 'category';
    tickFormatter?: (value: any) => string;
    width?: number;
  }

  export interface TooltipProps {
    formatter?: (value: any) => string;
  }

  export const BarChart: ComponentType<ChartProps>;
  export const Bar: ComponentType<BarProps>;
  export const XAxis: ComponentType<XAxisProps>;
  export const YAxis: ComponentType<YAxisProps>;
  export const CartesianGrid: ComponentType<{ strokeDasharray?: string }>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const ResponsiveContainer: ComponentType<{ width: string | number; height: string | number }>;
  export const LineChart: ComponentType<ChartProps>;
  export const Line: ComponentType<any>;
  export const PieChart: ComponentType<{ children?: ReactNode }>;
  export const Pie: ComponentType<PieProps>;
  export const Cell: ComponentType<CellProps>;
} 