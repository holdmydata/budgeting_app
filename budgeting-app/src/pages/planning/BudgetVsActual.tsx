import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
// import { mockBudgetEntries, mockGLAccounts } from '../../services/mockData';

// For now, use static mock data for months
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const glAccounts = [
  { id: '6010', name: 'IT Equipment' },
  { id: '6020', name: 'Software Licenses' },
  { id: '6030', name: 'IT Services' },
];
const planned = {
  '6010': [10000, 12000, 11000, 9000, 9500, 10000, 10500, 11000, 12000, 11500, 11000, 10000],
  '6020': [8000, 8500, 9000, 9500, 9000, 8500, 8000, 8500, 9000, 9500, 9000, 8500],
  '6030': [7000, 7500, 8000, 8500, 8000, 7500, 7000, 7500, 8000, 8500, 8000, 7500],
};
const actual = {
  '6010': [9500, 12500, 10500, 9200, 9800, 9900, 10800, 11200, 11900, 11700, 10800, 10200],
  '6020': [8200, 8300, 9100, 9400, 9100, 8600, 7900, 8600, 9100, 9400, 9100, 8600],
  '6030': [6900, 7600, 8100, 8400, 8100, 7600, 7100, 7600, 8100, 8400, 8100, 7600],
};
const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const BudgetVsActual: React.FC = () => {
  // Calculate totals
  const totalPlanned = Object.values(planned).flat().reduce((a, b) => a + b, 0);
  const totalActual = Object.values(actual).flat().reduce((a, b) => a + b, 0);
  const totalVariance = totalPlanned - totalActual;

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 }, pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Budget vs Actual Intelligence</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
        Analyze variances between planned and actuals, drill down by GL, and spot trends or overruns early.
      </Typography>

      {/* Responsive Summary Cards - row on desktop, stack on mobile */}
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

      {/* Trend Chart Placeholder - responsive and centered */}
      <Paper sx={{ p: 2, mb: 3, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.500', width: '100%' }}>
        {/* TODO: Add line/bar chart for planned vs actual over time */}
        <Typography variant="body2">[Trend Chart: Planned vs Actual over time]</Typography>
      </Paper>

      {/* Variance Table - horizontally scrollable on mobile */}
      <Paper sx={{ p: 1.5, mb: 3, overflowX: 'auto', width: '100%' }}>
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
                <TableRow key={gl.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{gl.id} - {gl.name}</TableCell>
                  {months.map((_, i) => {
                    const plan = planned[gl.id][i];
                    const act = actual[gl.id][i];
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
      </Paper>

      {/* TODO: Add drill-down modal or expandable rows for GL/project/vendor breakdown */}
      {/* TODO: Add predictive alert cards ("You are on track to overspend GL 6020 by month-end") */}
    </Box>
  );
};

export { BudgetVsActual };
