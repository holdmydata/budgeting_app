import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Table, TableHead, TableRow, TableCell, TableBody, Slider, CircularProgress } from '@mui/material';
import { dataService } from '../../services/dataService';

const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const StrategicPlanning: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    dataService.fetchProjects()
      .then((data) => {
        setProjects(data);
        // Compute years from project allocations if available, else use 2023-2025 as fallback
        if (data.length > 0 && data[0].allocation) {
          setYears(data[0].allocation.map((_: any, idx: number) => 2023 + idx));
        } else {
          setYears([2023, 2024, 2025]);
        }
      })
      .catch(() => setError('Failed to load project data'))
      .finally(() => setIsLoading(false));
  }, []);

  // Example: total allocation and best ROI
  const totalAlloc = years.map((_, i) => projects.reduce((sum, p) => sum + (p.allocation ? p.allocation[i] : 0), 0));
  const bestROI = projects.reduce((a, b) => (a.roi > b.roi ? a : b), projects[0] || { name: '', roi: 0 });

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}><Typography color="error">{error}</Typography></Box>;
  }

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
                  {years.map((_, i) => (
                    <TableCell key={i} align="right">{currency(p.allocation ? p.allocation[i] : 0)}</TableCell>
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

export default StrategicPlanning;
