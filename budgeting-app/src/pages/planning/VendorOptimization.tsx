import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

// Static mock data for vendors
const vendors = [
  { name: 'Acme Tech', cost: 120000, quality: 4.5, delivery: 4.8, internalCost: 100000 },
  { name: 'DataSphere', cost: 95000, quality: 4.9, delivery: 4.7, internalCost: 110000 },
  { name: 'AgriTech', cost: 130000, quality: 4.2, delivery: 4.5, internalCost: 125000 },
];
const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const VendorOptimization: React.FC = () => {
  // Find top vendor by quality
  const topVendor = vendors.reduce((a, b) => (a.quality > b.quality ? a : b));
  // Calculate potential savings
  const bestAlt = vendors.reduce((a, b) => (a.cost < b.cost ? a : b));
  const savings = vendors[0].cost - bestAlt.cost;

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 }, pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Vendor & Cost Optimization</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
        Analyze vendor performance, compare internal vs external costs, and discover cost-saving opportunities.
      </Typography>

      {/* Responsive Summary Cards - row on desktop, stack on mobile */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 1, sm: 2 },
          mb: 2,
          width: '100%',
        }}
      >
        <Card variant="outlined" sx={{ minWidth: 140, p: 0.5, boxShadow: 'none' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>Top Vendor (Quality)</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{topVendor.name}</Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>Score: {topVendor.quality}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ minWidth: 140, p: 0.5, boxShadow: 'none' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>Best Alt. Savings</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{currency(savings)}</Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>vs. {bestAlt.name}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Vendor Table - horizontally scrollable on mobile */}
      <Paper sx={{ p: 1.5, mb: 3, overflowX: 'auto', width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: 17 }}>
          Vendor Performance & Cost Comparison
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ width: '100%', minWidth: 700 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Cost</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Quality</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Delivery</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Internal Cost</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Savings vs Internal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map(v => (
                <TableRow key={v.name}>
                  <TableCell sx={{ fontWeight: 600 }}>{v.name}</TableCell>
                  <TableCell align="right">{currency(v.cost)}</TableCell>
                  <TableCell align="right">{v.quality}</TableCell>
                  <TableCell align="right">{v.delivery}</TableCell>
                  <TableCell align="right">{currency(v.internalCost)}</TableCell>
                  <TableCell align="right" sx={{ color: v.internalCost > v.cost ? 'success.main' : v.internalCost < v.cost ? 'error.main' : 'text.secondary' }}>
                    {currency(v.internalCost - v.cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Placeholder for cost savings suggestions, internal vs external chart, and contract renewal alerts */}
      <Paper sx={{ p: 2, mb: 3, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.500', width: '100%' }}>
        {/* TODO: Add cost savings suggestions, internal vs external chart, and contract renewal alerts */}
        <Typography variant="body2">[Cost Savings Suggestions, Internal vs External Chart, Contract Renewal Alerts]</Typography>
      </Paper>

      {/* TODO: Add alternative vendor suggestions and performance charts */}
    </Box>
  );
};

export { VendorOptimization };
