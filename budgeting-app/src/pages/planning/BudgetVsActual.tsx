import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';
import { dataService } from '../../services/dataService';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const BudgetVsActual: React.FC = () => {
  const [glAccounts, setGLAccounts] = useState<any[]>([]);
  const [budgetEntries, setBudgetEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      dataService.fetchGLAccounts(),
      dataService.fetchBudgetEntries()
    ])
      .then(([gls, budgets]) => {
        setGLAccounts(gls);
        setBudgetEntries(budgets);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setIsLoading(false));
  }, []);

  // Compute planned and actuals per GL per month
  const getPlanned = (glId: string) => {
    const entry = budgetEntries.find((b: any) => b.glAccount === glId);
    if (!entry) return Array(12).fill(0);
    // Assume amount is annual, spread evenly
    return Array(12).fill(Math.round((entry.amount ?? 0) / 12));
  };
  const getActual = (glId: string) => {
    const entry = budgetEntries.find((b: any) => b.glAccount === glId);
    if (!entry) return Array(12).fill(0);
    // Assume allocatedAmount is annual, spread evenly
    return Array(12).fill(Math.round((entry.allocatedAmount ?? 0) / 12));
  };

  // Calculate totals
  const totalPlanned = glAccounts.reduce((sum, gl) => sum + getPlanned(gl.accountNumber).reduce((a, b) => a + b, 0), 0);
  const totalActual = glAccounts.reduce((sum, gl) => sum + getActual(gl.accountNumber).reduce((a, b) => a + b, 0), 0);
  const totalVariance = totalPlanned - totalActual;

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 }, pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Budget vs Actual Intelligence</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
        Analyze variances between planned and actuals, drill down by GL, and spot trends or overruns early.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: { xs: 1, sm: 2 },
          mb: 2,
          width: '100%',
        }}
      >
        <Card variant="outlined" sx={{ minWidth: 140, p: 0.5, boxShadow: 'none' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>Total Planned</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{currency(totalPlanned)}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ minWidth: 140, p: 0.5, boxShadow: 'none' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>Total Actual</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{currency(totalActual)}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ minWidth: 140, p: 0.5, boxShadow: 'none' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>Total Variance</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }} color={totalVariance > 0 ? 'success.main' : totalVariance < 0 ? 'error.main' : 'text.secondary'}>
              {totalVariance > 0 ? '+' : ''}{currency(totalVariance)}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Paper sx={{ p: 2, mb: 3, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.500', width: '100%' }}>
        <Typography variant="body2">[Trend Chart: Planned vs Actual over time]</Typography>
      </Paper>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: 17 }}>
        GL Account Variance by Month
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Box sx={{ width: '100%', minWidth: 700 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>GL Account</TableCell>
              {months.map(month => (
                <TableCell key={month} align="right" sx={{ fontWeight: 700 }}>{month}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {glAccounts.map(gl => (
              <TableRow key={gl.accountNumber}>
                <TableCell sx={{ fontWeight: 600 }}>{gl.accountNumber} - {gl.accountName}</TableCell>
                {months.map((_, i) => {
                  const plan = getPlanned(gl.accountNumber)[i];
                  const act = getActual(gl.accountNumber)[i];
                  const variance = plan - act;
                  return (
                    <TableCell key={i} align="right">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{currency(plan)}</Typography>
                        <Typography variant="caption" color="text.secondary">{currency(act)}</Typography>
                        <Typography variant="caption" color={variance > 0 ? 'success.main' : variance < 0 ? 'error.main' : 'text.secondary'}>
                          {variance > 0 ? '+' : ''}{currency(variance)}
                        </Typography>
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {/* TODO: Add predictive alert cards ("You are on track to overspend GL 6020 by month-end") */}
    </Box>
  );
};

export default BudgetVsActual;
