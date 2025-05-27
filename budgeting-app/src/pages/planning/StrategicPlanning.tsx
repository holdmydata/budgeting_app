import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Table, TableHead, TableRow, TableCell, TableBody, Slider } from '@mui/material';

// Static mock data for projects and years
const years = [2024, 2025, 2026];
const projects = [
  { name: 'ERP Implementation', roi: 1.5, allocation: [200000, 150000, 100000] },
  { name: 'Cloud Migration', roi: 2.1, allocation: [120000, 180000, 160000] },
  { name: 'Security Upgrade', roi: 1.8, allocation: [90000, 110000, 130000] },
];
const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const StrategicPlanning: React.FC = () => {
  // Example: total allocation and best ROI
  const totalAlloc = years.map((_, i) => projects.reduce((sum, p) => sum + p.allocation[i], 0));
  const bestROI = projects.reduce((a, b) => (a.roi > b.roi ? a : b));

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 }, pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Strategic Planning Workspace</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
        Optimize resource allocation, plan across multiple years, and maximize ROI for your initiatives.
      </Typography>

      {/* Responsive Summary Cards - row on desktop, stack on mobile */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: `repeat(${years.length + 1}, 1fr)` },
          gap: { xs: 1, sm: 2 },
          mb: 2,
          width: '100%',
        }}
      >
        <Card variant="outlined" sx={{ minWidth: 140, p: 0.5, boxShadow: 'none' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>Best ROI Project</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{bestROI.name}</Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>ROI: {bestROI.roi}x</Typography>
          </CardContent>
        </Card>
        {years.map((year, idx) => (
          <Card key={year} variant="outlined" sx={{ minWidth: 120, p: 0.5, boxShadow: 'none' }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>{year} Allocation</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{currency(totalAlloc[idx])}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Resource Modeler Placeholder */}
      <Paper sx={{ p: 2, mb: 3, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.500', width: '100%' }}>
        {/* TODO: Add resource allocation sliders/inputs */}
        <Typography variant="body2">[Resource Modeler: Sliders/Inputs for allocation constraints]</Typography>
      </Paper>

      {/* Multi-Year Planning Table - horizontally scrollable on mobile */}
      <Paper sx={{ p: 1.5, mb: 3, overflowX: 'auto', width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: 17 }}>
          Multi-Year Project Allocation
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ width: '100%', minWidth: 700 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                {years.map(year => (
                  <TableCell key={year} align="right" sx={{ fontWeight: 700 }}>{year}</TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 700 }}>ROI</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map(p => (
                <TableRow key={p.name}>
                  <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                  {p.allocation.map((alloc, i) => (
                    <TableCell key={i} align="right">{currency(alloc)}</TableCell>
                  ))}
                  <TableCell align="right">{p.roi}x</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* ROI Chart Placeholder */}
      <Paper sx={{ p: 2, mb: 3, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.500', width: '100%' }}>
        {/* TODO: Add ROI optimization chart and scenario builder */}
        <Typography variant="body2">[ROI Chart, Scenario Builder, Confidence Intervals]</Typography>
      </Paper>
    </Box>
  );
};

export { StrategicPlanning };
