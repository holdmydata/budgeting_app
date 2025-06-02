import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';
import { dataService } from '../../services/dataService';

const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const VendorOptimization: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    dataService.fetchVendors()
      .then(setVendors)
      .catch(() => setError('Failed to load vendor data'))
      .finally(() => setIsLoading(false));
  }, []);

  // Find top vendor by quality
  const topVendor = vendors.reduce((a, b) => (a.quality > b.quality ? a : b), vendors[0] || { vendorName: '', quality: 0 });
  // Find best alternative for savings (lowest cost)
  const bestAlt = vendors.reduce((a, b) => (a.cost < b.cost ? a : b), vendors[0] || { vendorName: '', cost: 0 });
  // Calculate savings (assume internalCost is available)
  const savings = bestAlt.internalCost && bestAlt.cost ? bestAlt.internalCost - bestAlt.cost : 0;

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}><Typography color="error">{error}</Typography></Box>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 }, pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Vendor Optimization</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
        Analyze vendor performance, cost savings, and identify optimization opportunities.
      </Typography>
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{topVendor.vendorName}</Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>Score: {topVendor.quality}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ minWidth: 140, p: 0.5, boxShadow: 'none' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>Best Alt. Savings</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{currency(savings)}</Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>vs. {bestAlt.vendorName}</Typography>
          </CardContent>
        </Card>
      </Box>
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
              <TableRow key={v.id}>
                <TableCell sx={{ fontWeight: 600 }}>{v.vendorName}</TableCell>
                <TableCell align="right">{currency(v.cost ?? 0)}</TableCell>
                <TableCell align="right">{v.quality ?? '-'}</TableCell>
                <TableCell align="right">{v.delivery ?? '-'}</TableCell>
                <TableCell align="right">{currency(v.internalCost ?? 0)}</TableCell>
                <TableCell align="right" sx={{ color: v.internalCost > v.cost ? 'success.main' : v.internalCost < v.cost ? 'error.main' : 'text.secondary' }}>
                  {currency((v.internalCost ?? 0) - (v.cost ?? 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {/* Placeholder for cost savings suggestions, internal vs external chart, and contract renewal alerts */}
    </Box>
  );
};

export { VendorOptimization };
