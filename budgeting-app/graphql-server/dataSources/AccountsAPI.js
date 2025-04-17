const { DataSource } = require('apollo-datasource');

class AccountsAPI extends DataSource {
  constructor({ knexInstance }) {
    super();
    this.knex = knexInstance;
  }

  initialize(config) {
    this.context = config.context;
  }

  async getAccountByNumber(accountnum) {
    return this.knex('accounts')
      .where({ accountnum })
      .first();
  }

  async getAccounts({ limit = 20, offset = 0 }) {
    return this.knex('accounts')
      .orderBy('accountnum')
      .limit(limit)
      .offset(offset);
  }

  async getAccountBalance(accountnum) {
    // Get all transactions for the account
    const transactions = await this.knex('transactions')
      .where({ accountnum })
      .orderBy('transdate', 'asc');
    
    // Calculate current balance
    let balance = 0;
    transactions.forEach(transaction => {
      const amount = transaction.amountcur;
      if (transaction.debit_credit_flag === 'C') {
        balance += amount;
      } else {
        balance -= amount;
      }
    });
    
    return balance;
  }

  async getAccountStatus(accountnum) {
    // Simple logic for account status based on balance
    // This could be extended with more complex business rules
    const balance = await this.getAccountBalance(accountnum);
    
    // Get the latest transaction for this account to check activity
    const latestTransaction = await this.knex('transactions')
      .where({ accountnum })
      .orderBy('transdate', 'desc')
      .first();
      
    if (!latestTransaction) {
      return 'INACTIVE';
    }
    
    // Check if the latest transaction is older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const latestTransDate = new Date(latestTransaction.transdate);
    
    if (latestTransDate < ninetyDaysAgo) {
      return 'INACTIVE';
    }
    
    if (balance < 0) {
      return 'OVERDUE';
    }
    
    return 'ACTIVE';
  }
}

module.exports = AccountsAPI; 