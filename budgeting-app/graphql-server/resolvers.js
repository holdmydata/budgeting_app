// Sample resolvers implementation for financial transactions GraphQL schema
const resolvers = {
  Query: {
    transaction: async (_, { transactionID }, { dataSources }) => {
      return dataSources.transactionsAPI.getTransactionById(transactionID);
    },
    
    transactions: async (_, { limit = 20, offset = 0, accountnum, startDate, endDate }, { dataSources }) => {
      return dataSources.transactionsAPI.getTransactions({
        limit,
        offset,
        accountnum,
        startDate,
        endDate
      });
    },
    
    account: async (_, { accountnum }, { dataSources }) => {
      return dataSources.accountsAPI.getAccountByNumber(accountnum);
    },
    
    accounts: async (_, { limit = 20, offset = 0 }, { dataSources }) => {
      return dataSources.accountsAPI.getAccounts({ limit, offset });
    },
    
    periodSummary: async (_, { accountnum, period, date }, { dataSources }) => {
      return dataSources.transactionsAPI.getPeriodSummary(accountnum, period, date);
    },
    
    budgetEntries: async (_, { accountnum, period }, { dataSources }) => {
      return dataSources.budgetAPI.getBudgetEntries(accountnum, period);
    }
  },
  
  Mutation: {
    createBudgetEntry: async (_, { accountnum, amount, period, description }, { dataSources }) => {
      return dataSources.budgetAPI.createBudgetEntry({
        accountnum,
        amount,
        period,
        description
      });
    },
    
    updateBudgetEntry: async (_, { id, amount, description }, { dataSources }) => {
      return dataSources.budgetAPI.updateBudgetEntry(id, {
        amount,
        description
      });
    },
    
    deleteBudgetEntry: async (_, { id }, { dataSources }) => {
      return dataSources.budgetAPI.deleteBudgetEntry(id);
    }
  },
  
  Transaction: {
    // Format RECID as string
    recid: (transaction) => String(transaction.RECID),
    
    // Computed fields
    runningBalance: async (transaction, _, { dataSources }) => {
      return dataSources.transactionsAPI.calculateRunningBalance(
        transaction.accountnum,
        transaction.transdate
      );
    },
    
    accountStatus: async (transaction, _, { dataSources }) => {
      return dataSources.accountsAPI.getAccountStatus(transaction.accountnum);
    }
  },
  
  Account: {
    transactions: async (account, { limit = 20, offset = 0 }, { dataSources }) => {
      return dataSources.transactionsAPI.getTransactionsByAccount(
        account.accountnum,
        { limit, offset }
      );
    },
    
    periodSummaries: async (account, { period }, { dataSources }) => {
      return dataSources.transactionsAPI.getAccountPeriodSummaries(
        account.accountnum,
        period
      );
    },
    
    balance: async (account, _, { dataSources }) => {
      return dataSources.accountsAPI.getAccountBalance(account.accountnum);
    }
  }
};

module.exports = resolvers; 