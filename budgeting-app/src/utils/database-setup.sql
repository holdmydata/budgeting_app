-- Database setup script for Budgeting App
-- This script creates the necessary tables in your Databricks SQL warehouse
-- You can modify the catalog and schema as needed

-- Create a schema if not exists
CREATE SCHEMA IF NOT EXISTS ${catalog}.${schema};

-- Use the schema
USE ${schema};

-- GL Accounts table with Type 2 SCD support
CREATE TABLE IF NOT EXISTS gl_accounts (
  id STRING, 
  account_number STRING,
  account_name STRING,
  account_type STRING,
  is_active BOOLEAN,
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  is_current BOOLEAN,
  department_id STRING,
  modified_by STRING,
  change_reason STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id STRING,
  project_code STRING,
  project_name STRING,
  description STRING,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  budget DOUBLE,
  spent DOUBLE,
  status STRING,
  owner STRING,
  priority STRING,
  gl_account STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Financial Transactions table (Actuals)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id STRING,
  transaction_date TIMESTAMP,
  vendor STRING,
  description STRING,
  amount DOUBLE,
  gl_account STRING,
  project STRING,
  status STRING,
  voucher_number STRING,
  user_id STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Budget Entries table
CREATE TABLE IF NOT EXISTS budget_entries (
  id STRING,
  fiscal_year STRING,
  gl_account STRING,
  amount DOUBLE,
  allocated_amount DOUBLE,
  remaining_amount DOUBLE,
  description STRING
);

-- Vendor Profile table
CREATE TABLE IF NOT EXISTS vendors (
  id STRING,
  vendor_name STRING,
  vendor_code STRING,
  contact_name STRING,
  contact_email STRING,
  contact_phone STRING,
  category STRING,
  performance_score DOUBLE,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- KPI View
CREATE OR REPLACE VIEW kpi_view AS
WITH 
total_budget AS (
  SELECT SUM(amount) as value FROM budget_entries WHERE fiscal_year = '2023'
),
spent_budget AS (
  SELECT SUM(amount) as value FROM financial_transactions 
  WHERE YEAR(transaction_date) = 2023
),
remaining_budget AS (
  SELECT 
    (SELECT value FROM total_budget) - (SELECT value FROM spent_budget) as value
),
projects_count AS (
  SELECT COUNT(*) as value FROM projects WHERE status = 'In Progress'
)
SELECT 
  'kpi-1' as id,
  'Total Budget' as title,
  value,
  CONCAT('$', FORMAT_NUMBER(value, 0)) as formattedValue,
  0.05 as change,
  '5% increase YoY' as secondaryValue
FROM total_budget
UNION ALL
SELECT 
  'kpi-2' as id,
  'Spent' as title,
  value,
  CONCAT('$', FORMAT_NUMBER(value, 0)) as formattedValue,
  value / (SELECT value FROM total_budget) as change,
  CONCAT(ROUND(100 * value / (SELECT value FROM total_budget), 1), '% of budget') as secondaryValue
FROM spent_budget
UNION ALL
SELECT 
  'kpi-3' as id,
  'Remaining' as title,
  value,
  CONCAT('$', FORMAT_NUMBER(value, 0)) as formattedValue,
  value / (SELECT value FROM total_budget) as change,
  CONCAT(ROUND(100 * value / (SELECT value FROM total_budget), 1), '% remaining') as secondaryValue
FROM remaining_budget
UNION ALL
SELECT 
  'kpi-4' as id,
  'Projects' as title,
  value,
  CAST(value AS STRING) as formattedValue,
  0 as change,
  '3 critical priority' as secondaryValue
FROM projects_count;

-- GL Account Budget and Actual View
CREATE OR REPLACE VIEW gl_account_summary AS
SELECT
  ga.account_number,
  ga.account_name,
  be.fiscal_year,
  be.amount as budget_amount,
  SUM(CASE WHEN ft.id IS NOT NULL THEN ft.amount ELSE 0 END) as actual_amount,
  be.amount - SUM(CASE WHEN ft.id IS NOT NULL THEN ft.amount ELSE 0 END) as remaining_amount,
  SUM(CASE WHEN ft.id IS NOT NULL THEN ft.amount ELSE 0 END) / NULLIF(be.amount, 0) * 100 as utilization_percentage
FROM
  gl_accounts ga
LEFT JOIN
  budget_entries be ON ga.account_number = be.gl_account
LEFT JOIN
  financial_transactions ft ON ga.account_number = ft.gl_account 
    AND YEAR(ft.transaction_date) = CAST(be.fiscal_year AS INT)
WHERE
  ga.is_current = true
GROUP BY
  ga.account_number, ga.account_name, be.fiscal_year, be.amount;

-- Project Budget and Actual View
CREATE OR REPLACE VIEW project_summary AS
SELECT
  p.id,
  p.project_code,
  p.project_name,
  p.budget as budget_amount,
  SUM(CASE WHEN ft.id IS NOT NULL THEN ft.amount ELSE 0 END) as actual_amount,
  p.budget - SUM(CASE WHEN ft.id IS NOT NULL THEN ft.amount ELSE 0 END) as remaining_amount,
  SUM(CASE WHEN ft.id IS NOT NULL THEN ft.amount ELSE 0 END) / NULLIF(p.budget, 0) * 100 as utilization_percentage,
  p.status,
  p.priority
FROM
  projects p
LEFT JOIN
  financial_transactions ft ON p.id = ft.project
GROUP BY
  p.id, p.project_code, p.project_name, p.budget, p.status, p.priority;

-- Monthly Budget vs Actual View
CREATE OR REPLACE VIEW monthly_budget_vs_actual AS
WITH months AS (
  SELECT MONTH(d) as month_num, DATE_FORMAT(d, 'MMM') as month_name
  FROM (
    SELECT DATE_ADD('2023-01-01', i) as d
    FROM (
      SELECT EXPLODE(SEQUENCE(0, 11)) as i
    )
  )
)
SELECT
  m.month_num,
  m.month_name,
  COALESCE(SUM(be.amount) / 12, 0) as planned_amount,
  COALESCE(SUM(ft.amount), 0) as actual_amount
FROM
  months m
LEFT JOIN
  budget_entries be ON be.fiscal_year = '2023'
LEFT JOIN
  financial_transactions ft ON MONTH(ft.transaction_date) = m.month_num 
    AND YEAR(ft.transaction_date) = 2023
GROUP BY
  m.month_num, m.month_name
ORDER BY
  m.month_num;

-- Insert sample data if needed
INSERT INTO gl_accounts 
VALUES 
('gl-1', '6010', 'IT Equipment', 'Expense', true, '2023-01-01', NULL, true, 'dept-1', 'system', 'Initial setup', '2023-01-01', '2023-01-01'),
('gl-2', '6020', 'Software Licenses', 'Expense', true, '2023-01-01', NULL, true, 'dept-1', 'system', 'Initial setup', '2023-01-01', '2023-01-01'),
('gl-3', '6030', 'IT Services', 'Expense', true, '2023-01-01', NULL, true, 'dept-1', 'system', 'Initial setup', '2023-01-01', '2023-01-01'),
('gl-4', '6040', 'Cloud Infrastructure', 'Expense', true, '2023-01-01', NULL, true, 'dept-1', 'system', 'Initial setup', '2023-01-01', '2023-01-01'),
('gl-5', '6050', 'Network & Telecom', 'Expense', true, '2023-01-01', NULL, true, 'dept-1', 'system', 'Initial setup', '2023-01-01', '2023-01-01');

INSERT INTO projects
VALUES
('proj-1', 'ERP-2023', 'ERP Implementation', 'Implementation of new ERP system across all departments', '2023-01-15', '2023-12-31', 850000, 450000, 'In Progress', 'John Smith', 'High', '6020', '2023-01-01', '2023-01-01'),
('proj-2', 'NET-2023', 'Network Infrastructure Upgrade', 'Upgrade of corporate network infrastructure and security', '2023-03-01', '2023-09-30', 500000, 380000, 'In Progress', 'Lisa Johnson', 'Critical', '6050', '2023-01-01', '2023-01-01'),
('proj-3', 'CLOUD-2023', 'Cloud Migration', 'Migration of on-premise applications to cloud infrastructure', '2023-02-15', '2024-02-14', 750000, 275000, 'In Progress', 'Michael Chen', 'High', '6040', '2023-01-01', '2023-01-01'),
('proj-4', 'SEC-2023', 'Security Enhancement Program', 'Implementation of enhanced security controls and monitoring', '2023-04-01', '2023-12-31', 450000, 190000, 'In Progress', 'Sarah Williams', 'Critical', '6030', '2023-01-01', '2023-01-01');

INSERT INTO vendors
VALUES 
('vendor-1', 'Microsoft', 'MS-001', 'John Doe', 'john@microsoft.com', '555-1234', 'Software', 4.5, true, '2023-01-01', '2023-01-01'),
('vendor-2', 'Dell', 'DL-001', 'Jane Smith', 'jane@dell.com', '555-5678', 'Hardware', 4.2, true, '2023-01-01', '2023-01-01'),
('vendor-3', 'SAP', 'SAP-001', 'Mike Johnson', 'mike@sap.com', '555-9012', 'Software', 4.7, true, '2023-01-01', '2023-01-01'),
('vendor-4', 'Cisco', 'CSCO-001', 'Lisa Brown', 'lisa@cisco.com', '555-3456', 'Network', 4.3, true, '2023-01-01', '2023-01-01'),
('vendor-5', 'Accenture', 'ACC-001', 'David Lee', 'david@accenture.com', '555-7890', 'Consulting', 4.6, true, '2023-01-01', '2023-01-01');

INSERT INTO financial_transactions
VALUES
('tx-1', '2023-05-15', 'vendor-1', 'Azure Cloud Services - April', 45000, '6040', 'proj-3', 'Processed', 'INV-2023-001', 'user-1', '2023-05-15', '2023-05-15'),
('tx-2', '2023-05-12', 'vendor-2', 'Server Hardware for Data Center', 125000, '6010', 'proj-4', 'Processed', 'PO-2023-001', 'user-2', '2023-05-12', '2023-05-12'),
('tx-3', '2023-05-10', 'vendor-3', 'ERP Annual License', 180000, '6020', 'proj-1', 'Processed', 'INV-2023-002', 'user-1', '2023-05-10', '2023-05-10'),
('tx-4', '2023-05-08', 'vendor-4', 'Network Equipment - Phase 1', 230000, '6050', 'proj-2', 'Processed', 'PO-2023-002', 'user-3', '2023-05-08', '2023-05-08'),
('tx-5', '2023-05-05', 'vendor-5', 'Consulting Services - April', 85000, '6030', 'proj-1', 'Processed', 'INV-2023-003', 'user-2', '2023-05-05', '2023-05-05');

INSERT INTO budget_entries
VALUES
('budget-1', '2023', '6010', 500000, 275000, 225000, 'IT Equipment budget for FY23'),
('budget-2', '2023', '6020', 350000, 290000, 60000, 'Software Licenses budget for FY23'),
('budget-3', '2023', '6030', 450000, 210000, 240000, 'IT Services budget for FY23'),
('budget-4', '2023', '6040', 600000, 250000, 350000, 'Cloud Infrastructure budget for FY23'),
('budget-5', '2023', '6050', 300000, 120000, 180000, 'Network & Telecom budget for FY23'); 