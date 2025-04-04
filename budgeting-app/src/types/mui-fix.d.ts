// Fix for Material-UI Grid component type issues
import '@mui/material/Grid';

declare module '@mui/material/Grid' {
  interface GridProps {
    item?: boolean;
    container?: boolean;
    spacing?: number;
    xs?: number | boolean;
    sm?: number | boolean;
    md?: number | boolean;
    lg?: number | boolean;
    xl?: number | boolean;
  }
}

// Fix for ResponsiveContainer from recharts
import 'recharts';

declare module 'recharts' {
  interface ResponsiveContainerProps {
    children?: React.ReactNode;
  }
} 