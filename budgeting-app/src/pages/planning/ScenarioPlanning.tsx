import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Grid,
  Paper,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { mockBudgetEntries, mockGLAccounts } from '../../services/mockData';

// Currency formatter
const currency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

// Types
interface Scenario {
  id: string;
  name: string;
  adjustments: Record<string, number[]>; // glAccountId -> [Jan, Feb, ..., Dec]
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Helper to create empty monthly array
const emptyMonths = () => Array(12).fill(0);

const defaultScenarios: Scenario[] = [
  { id: 'current', name: 'Current Plan', adjustments: {} },
  { id: 'cut10', name: '10% Cut', adjustments: {} },
  { id: 'growth', name: 'Growth', adjustments: {} }
];

const ScenarioPlanning: React.FC = () => {
  // State
  const [scenarios, setScenarios] = useState<Scenario[]>(defaultScenarios);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [editingScenarioName, setEditingScenarioName] = useState<string | null>(null);
  const [scenarioNameInput, setScenarioNameInput] = useState('');
  const [monthlyMode, setMonthlyMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(0); // For summary cards in monthly mode

  // Data
  const glAccounts = mockGLAccounts;
  const baseBudgets = mockBudgetEntries;

  // Helper: get scenario-adjusted budget for a GL (annual or monthly)
  const getBudgetForGL = (scenario: Scenario, glId: string, monthIdx?: number): number | number[] => {
    const base = baseBudgets.find(b => b.glAccount === glAccounts.find(g => g.id === glId)?.accountNumber);
    if (monthlyMode) {
      const arr = scenario.adjustments[glId] ?? (base ? Array(12).fill(Math.round((base.amount ?? 0) / 12)) : emptyMonths());
      return monthIdx !== undefined ? arr[monthIdx] : arr;
    } else {
      if (scenario.adjustments[glId]) {
        return scenario.adjustments[glId].reduce((a, b) => a + b, 0);
      }
      return base ? base.amount : 0;
    }
  };

  // Helper: get actuals for a GL (annual or monthly)
  const getActualForGL = (glId: string, monthIdx?: number): number | number[] => {
    const base = baseBudgets.find(b => b.glAccount === glAccounts.find(g => g.id === glId)?.accountNumber);
    if (monthlyMode) {
      const arr = base ? Array(12).fill(Math.round((base.allocatedAmount ?? 0) / 12)) : emptyMonths();
      return monthIdx !== undefined ? arr[monthIdx] : arr;
    } else {
      return base ? base.allocatedAmount : 0;
    }
  };

  // Helper: update scenario adjustment (annual or monthly)
  const handleBudgetChange = (scenarioIdx: number, glId: string, value: number, monthIdx?: number) => {
    setScenarios(prev => {
      const updated = [...prev];
      const prevArr = updated[scenarioIdx].adjustments[glId] ?? emptyMonths();
      let newArr = [...prevArr];
      if (monthlyMode && monthIdx !== undefined) {
        newArr[monthIdx] = value;
      } else {
        // Annual: set all months to value/12
        newArr = Array(12).fill(Math.round(value / 12));
      }
      updated[scenarioIdx] = {
        ...updated[scenarioIdx],
        adjustments: {
          ...updated[scenarioIdx].adjustments,
          [glId]: newArr
        }
      };
      return updated;
    });
  };

  // Add new scenario
  const handleAddScenario = () => {
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`,
      adjustments: {}
    };
    setScenarios([...scenarios, newScenario]);
    setSelectedScenario(scenarios.length);
  };

  // Delete scenario
  const handleDeleteScenario = (idx: number) => {
    if (scenarios.length <= 1) return;
    setScenarios(prev => prev.filter((_, i) => i !== idx));
    setSelectedScenario(Math.max(0, selectedScenario - (idx < selectedScenario ? 1 : 0)));
  };

  // Edit scenario name
  const handleEditScenarioName = (idx: number) => {
    setEditingScenarioName(scenarios[idx].id);
    setScenarioNameInput(scenarios[idx].name);
  };
  const handleScenarioNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScenarioNameInput(e.target.value);
  };
  const handleScenarioNameSave = (idx: number) => {
    setScenarios(prev => prev.map((s, i) => i === idx ? { ...s, name: scenarioNameInput } : s));
    setEditingScenarioName(null);
  };

  // Summary: total budget, actuals, and variance per scenario
  let scenarioTotals: number[] = [];
  let totalActuals = 0;
  let scenarioVariances: number[] = [];
  if (monthlyMode) {
    // Monthly: show for selectedMonth, and annual total
    scenarioTotals = scenarios.map(scenario =>
      glAccounts.reduce((sum, gl) => {
        const val = getBudgetForGL(scenario, gl.id, selectedMonth);
        return sum + (typeof val === 'number' ? val : 0);
      }, 0)
    );
    totalActuals = glAccounts.reduce((sum, gl) => {
      const val = getActualForGL(gl.id, selectedMonth);
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    scenarioVariances = scenarioTotals.map(total => total - totalActuals);
  } else {
    // Annual
    scenarioTotals = scenarios.map(scenario =>
      glAccounts.reduce((sum, gl) => {
        const val = getBudgetForGL(scenario, gl.id);
        return sum + (typeof val === 'number' ? val : 0);
      }, 0)
    );
    totalActuals = glAccounts.reduce((sum, gl) => {
      const val = getActualForGL(gl.id);
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    scenarioVariances = scenarioTotals.map(total => total - totalActuals);
  }

  // --- UI ---
  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 }, pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Scenario Planning
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
        Model, compare, and analyze multiple budget scenarios. Adjust GL accounts and see real-time impact.
      </Typography>

      {/* Annual/Monthly Toggle */}
      <FormControlLabel
        control={<Switch checked={monthlyMode} onChange={() => setMonthlyMode(m => !m)} />}
        label={monthlyMode ? 'Monthly View' : 'Annual View'}
        sx={{ mb: 2 }}
      />
      {monthlyMode && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Select Month:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {MONTHS.map((m, idx) => (
              <Button
                key={m}
                size="small"
                variant={selectedMonth === idx ? 'contained' : 'outlined'}
                onClick={() => setSelectedMonth(idx)}
                sx={{ minWidth: 48 }}
              >
                {m}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* Scenario Tabs - scrollable on mobile */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, overflowX: 'auto' }}>
        <Tabs
          value={selectedScenario}
          onChange={(_, v) => setSelectedScenario(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flexGrow: 1, minHeight: 36 }}
        >
          {scenarios.map((scenario, idx) => (
            <Tab
              key={scenario.id}
              label={
                editingScenarioName === scenario.id ? (
                  <TextField
                    value={scenarioNameInput}
                    onChange={handleScenarioNameChange}
                    onBlur={() => handleScenarioNameSave(idx)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleScenarioNameSave(idx);
                    }}
                    size="small"
                    autoFocus
                    sx={{ minWidth: 100 }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {scenario.name}
                    <Tooltip title="Rename">
                      <IconButton size="small" sx={{ ml: 1 }} onClick={e => { e.stopPropagation(); handleEditScenarioName(idx); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {idx !== 0 && (
                      <Tooltip title="Delete">
                        <IconButton size="small" sx={{ ml: 0.5 }} onClick={e => { e.stopPropagation(); handleDeleteScenario(idx); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )
              }
              sx={{ minWidth: 120, fontWeight: 600, height: 36 }}
            />
          ))}
        </Tabs>
        <Button startIcon={<AddIcon />} onClick={handleAddScenario} sx={{ ml: 2, height: 36, whiteSpace: 'nowrap' }} variant="outlined">
          Add Scenario
        </Button>
      </Box>

      {/* Responsive Summary Cards - row on desktop, stack on mobile */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: `repeat(${scenarios.length + 1}, 1fr)` },
          gap: { xs: 1, sm: 2 },
          mb: 2,
          width: '100%',
        }}
      >
        <Card variant="outlined" sx={{ minWidth: 140, p: 0.5, boxShadow: 'none' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>Total Actuals{monthlyMode ? ` (${MONTHS[selectedMonth]})` : ''}</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{currency(totalActuals)}</Typography>
          </CardContent>
        </Card>
        {scenarios.map((scenario, idx) => (
          <Card
            key={scenario.id}
            variant={idx === selectedScenario ? 'elevation' : 'outlined'}
            sx={{ minWidth: 140, borderColor: idx === selectedScenario ? 'primary.main' : undefined, p: 0.5, boxShadow: 'none' }}
          >
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: 13 }}>{scenario.name}{monthlyMode ? ` (${MONTHS[selectedMonth]})` : ''}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18 }}>{currency(scenarioTotals[idx])}</Typography>
              <Typography variant="body2" sx={{ fontSize: 13 }} color={scenarioVariances[idx] > 0 ? 'success.main' : scenarioVariances[idx] < 0 ? 'error.main' : 'text.secondary'}>
                {scenarioVariances[idx] > 0 ? '+' : ''}{currency(typeof scenarioVariances[idx] === 'number' ? scenarioVariances[idx] : 0)} variance
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Editable Table with Actuals - horizontally scrollable on mobile */}
      <Paper sx={{ p: 1.5, mb: 3, overflowX: 'auto', width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: 17 }}>
          GL Account Budgets
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {monthlyMode ? (
          // --- MONTHLY TABLE ---
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 900 }}>
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ textAlign: 'left', p: 1, fontWeight: 700, fontSize: 15 }}>GL Account</Box>
                {MONTHS.map((m, idx) => (
                  <Box component="th" key={m} sx={{ textAlign: 'right', p: 1, fontWeight: 700, fontSize: 15 }}>{m}</Box>
                ))}
                <Box component="th" sx={{ textAlign: 'right', p: 1, fontWeight: 700, fontSize: 15 }}>Total</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {glAccounts.map(gl => (
                <Box component="tr" key={gl.id} sx={{ borderBottom: '1px solid #eee' }}>
                  <Box component="td" sx={{ p: 1, fontWeight: 600 }}>{gl.accountNumber} - {gl.accountName}</Box>
                  {MONTHS.map((_, mIdx) => (
                    <Box component="td" key={mIdx} sx={{ textAlign: 'right', p: 1, bgcolor: 'grey.50', fontWeight: 500 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>A: {currency(typeof getActualForGL(gl.id, mIdx) === 'number' ? getActualForGL(gl.id, mIdx) as number : 0)}</Typography>
                        {scenarios.map((scenario, sIdx) => (
                          <TextField
                            key={scenario.id}
                            type="number"
                            size="small"
                            value={typeof getBudgetForGL(scenario, gl.id, mIdx) === 'number' ? getBudgetForGL(scenario, gl.id, mIdx) as number : 0}
                            onChange={e => handleBudgetChange(sIdx, gl.id, Number(e.target.value), mIdx)}
                            inputProps={{ min: 0, style: { textAlign: 'right', width: 60, fontSize: 13 } }}
                            variant={sIdx === selectedScenario ? 'outlined' : 'standard'}
                            sx={{ mt: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                  <Box component="td" sx={{ textAlign: 'right', p: 1, fontWeight: 700 }}>
                    {scenarios.map((scenario, sIdx) => (
                      <Typography key={scenario.id} variant="body2" sx={{ fontWeight: 700, color: sIdx === selectedScenario ? 'primary.main' : 'text.secondary', fontSize: 14 }}>
                        {currency(Array.isArray(getBudgetForGL(scenario, gl.id)) ? (getBudgetForGL(scenario, gl.id) as number[]).reduce((a, b) => a + b, 0) : (typeof getBudgetForGL(scenario, gl.id) === 'number' ? getBudgetForGL(scenario, gl.id) as number : 0))}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
              {/* Variance Row for selected month */}
              <Box component="tr" sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>
                <Box component="td" sx={{ p: 1, fontWeight: 700 }}>Variance ({MONTHS[selectedMonth]})</Box>
                {MONTHS.map((_, mIdx) => (
                  <Box component="td" key={mIdx} sx={{ textAlign: 'right', p: 1, fontWeight: 700, color: scenarioVariances[selectedScenario] > 0 ? 'success.main' : scenarioVariances[selectedScenario] < 0 ? 'error.main' : 'text.secondary' }}>
                    {mIdx === selectedMonth ? (
                      <>{scenarioVariances[selectedScenario] > 0 ? '+' : ''}{currency(typeof scenarioVariances[selectedScenario] === 'number' ? scenarioVariances[selectedScenario] : 0)}</>
                    ) : null}
                  </Box>
                ))}
                <Box component="td" />
              </Box>
            </Box>
          </Box>
        ) : (
          // --- ANNUAL TABLE (as before) ---
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 600 }}>
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ textAlign: 'left', p: 1, fontWeight: 700, fontSize: 15 }}>GL Account</Box>
                <Box component="th" sx={{ textAlign: 'right', p: 1, fontWeight: 700, bgcolor: 'grey.100', fontSize: 15 }}>Actuals</Box>
                {scenarios.map((scenario, idx) => (
                  <Box component="th" key={scenario.id} sx={{ textAlign: 'right', p: 1, fontWeight: 700, fontSize: 15 }}>{scenario.name}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {glAccounts.map(gl => (
                <Box component="tr" key={gl.id} sx={{ borderBottom: '1px solid #eee' }}>
                  <Box component="td" sx={{ p: 1, fontWeight: 600 }}>{gl.accountNumber} - {gl.accountName}</Box>
                  <Box component="td" sx={{ textAlign: 'right', p: 1, bgcolor: 'grey.50', fontWeight: 500 }}>{currency(typeof getActualForGL(gl.id) === 'number' ? getActualForGL(gl.id) as number : 0)}</Box>
                  {scenarios.map((scenario, sIdx) => (
                    <Box component="td" key={scenario.id} sx={{ textAlign: 'right', p: 1 }}>
                      <TextField
                        type="number"
                        size="small"
                        value={typeof getBudgetForGL(scenario, gl.id) === 'number' ? getBudgetForGL(scenario, gl.id) as number : 0}
                        onChange={e => handleBudgetChange(sIdx, gl.id, Number(e.target.value))}
                        inputProps={{ min: 0, style: { textAlign: 'right', width: 90 } }}
                        variant={sIdx === selectedScenario ? 'outlined' : 'standard'}
                      />
                    </Box>
                  ))}
                </Box>
              ))}
              {/* Variance Row */}
              <Box component="tr" sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>
                <Box component="td" sx={{ p: 1, fontWeight: 700 }}>Variance</Box>
                <Box component="td" />
                {scenarios.map((scenario, idx) => (
                  <Box component="td" key={scenario.id} sx={{ textAlign: 'right', p: 1, fontWeight: 700, color: scenarioVariances[idx] > 0 ? 'success.main' : scenarioVariances[idx] < 0 ? 'error.main' : 'text.secondary' }}>
                    {scenarioVariances[idx] > 0 ? '+' : ''}{currency(typeof scenarioVariances[idx] === 'number' ? scenarioVariances[idx] : 0)}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Placeholder for charts and drill-downs */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        (Charts and drill-downs coming soon! Data model now supports monthly time series.)
      </Typography>
      {/* --- Comments for future chart integration --- */}
      {/*
        - In monthly mode, use time series charts (line/bar) for scenario comparison.
        - In annual mode, use summary/variance charts.
        - Data shape: scenarios, months, GLs, actuals, planned.
      */}
    </Box>
  );
};

export { ScenarioPlanning };
