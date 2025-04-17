const { DataSource } = require('apollo-datasource');
const { format, parseISO, subMonths, subQuarters, subYears, endOfMonth, endOfQuarter, endOfYear } = require('date-fns');

class TransactionsAPI extends DataSource {
  constructor({ knexInstance }) {
    super();
    this.knex = knexInstance;
  }

  initialize(config) {
    this.context = config.context;
  }

  async getTransactionById(transactionID) {
    return this.knex('transactions')
      .where({ transactionID })
      .first();
  }

  async getTransactions({ limit = 20, offset = 0, accountnum, startDate, endDate }) {
    const query = this.knex('transactions');
    
    if (accountnum) {
      query.where({ accountnum });
    }
    
    if (startDate) {
      query.where('transdate', '>=', startDate);
    }
    
    if (endDate) {
      query.where('transdate', '<=', endDate);
    }
    
    return query
      .orderBy('transdate', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async getTransactionsByAccount(accountnum, { limit = 20, offset = 0 }) {
    return this.knex('transactions')
      .where({ accountnum })
      .orderBy('transdate', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async calculateRunningBalance(accountnum, transactionDate) {
    // Get all transactions for the account up to the specified date
    const transactions = await this.knex('transactions')
      .where({ accountnum })
      .where('transdate', '<=', transactionDate)
      .orderBy('transdate', 'asc');
    
    // Calculate running balance
    let balance = 0;
    transactions.forEach(transaction => {
      const amount = transaction.amountcur;
      // Add for credits, subtract for debits (adjust based on your debit/credit convention)
      if (transaction.debit_credit_flag === 'C') {
        balance += amount;
      } else {
        balance -= amount;
      }
    });
    
    return balance;
  }

  async getPeriodSummary(accountnum, periodType, date = new Date().toISOString()) {
    const currentDate = parseISO(date);
    let startDate, endDate, periodLabel;
    
    // Determine period boundaries based on period type
    switch (periodType) {
      case 'MONTHLY':
        startDate = format(subMonths(currentDate, 1), 'yyyy-MM-dd');
        endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
        periodLabel = format(currentDate, 'yyyy-MM');
        break;
      case 'QUARTERLY':
        startDate = format(subQuarters(currentDate, 1), 'yyyy-MM-dd');
        endDate = format(endOfQuarter(currentDate), 'yyyy-MM-dd');
        periodLabel = `Q${Math.ceil(currentDate.getMonth() / 3)}-${format(currentDate, 'yyyy')}`;
        break;
      case 'YEARLY':
        startDate = format(subYears(currentDate, 1), 'yyyy-MM-dd');
        endDate = format(endOfYear(currentDate), 'yyyy-MM-dd');
        periodLabel = format(currentDate, 'yyyy');
        break;
      default:
        throw new Error(`Invalid period type: ${periodType}`);
    }
    
    // Get transactions for the specified period
    const transactions = await this.knex('transactions')
      .where({ accountnum })
      .whereBetween('transdate', [startDate, endDate]);
    
    // Calculate total amount
    let totalAmount = 0;
    transactions.forEach(transaction => {
      const amount = transaction.amountcur;
      if (transaction.debit_credit_flag === 'C') {
        totalAmount += amount;
      } else {
        totalAmount -= amount;
      }
    });
    
    return {
      period: periodLabel,
      startDate,
      endDate,
      totalAmount,
      transactionCount: transactions.length
    };
  }

  async getAccountPeriodSummaries(accountnum, periodType) {
    // Determine periods to fetch based on periodType
    const currentDate = new Date();
    let periods;
    
    switch (periodType) {
      case 'MONTHLY':
        periods = Array.from({ length: 12 }, (_, i) => {
          const date = subMonths(currentDate, i);
          return format(date, 'yyyy-MM-dd');
        });
        break;
      case 'QUARTERLY':
        periods = Array.from({ length: 4 }, (_, i) => {
          const date = subQuarters(currentDate, i);
          return format(date, 'yyyy-MM-dd');
        });
        break;
      case 'YEARLY':
        periods = Array.from({ length: 3 }, (_, i) => {
          const date = subYears(currentDate, i);
          return format(date, 'yyyy-MM-dd');
        });
        break;
      default:
        throw new Error(`Invalid period type: ${periodType}`);
    }
    
    // Get summaries for each period
    return Promise.all(
      periods.map(date => this.getPeriodSummary(accountnum, periodType, date))
    );
  }
}

module.exports = TransactionsAPI; 