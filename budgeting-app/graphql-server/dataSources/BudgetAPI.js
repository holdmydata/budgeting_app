const { DataSource } = require('apollo-datasource');

class BudgetAPI extends DataSource {
  constructor({ knexInstance }) {
    super();
    this.knex = knexInstance;
  }

  initialize(config) {
    this.context = config.context;
  }

  async getBudgetEntries(accountnum, period) {
    const query = this.knex('budget_entries').where({ accountnum });
    
    if (period) {
      query.where({ period });
    }
    
    return query.orderBy('period');
  }

  async createBudgetEntry({ accountnum, amount, period, description }) {
    // Check if the account exists
    const account = await this.knex('accounts')
      .where({ accountnum })
      .first();
      
    if (!account) {
      throw new Error(`Account ${accountnum} does not exist`);
    }
    
    // Insert the budget entry
    const [id] = await this.knex('budget_entries')
      .insert({
        accountnum,
        amount,
        period,
        description,
        created_at: new Date().toISOString()
      })
      .returning('id');
      
    // Return the created budget entry
    return this.knex('budget_entries')
      .where({ id })
      .first();
  }

  async updateBudgetEntry(id, { amount, description }) {
    const updateData = {};
    
    if (amount !== undefined) {
      updateData.amount = amount;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Update the budget entry
    await this.knex('budget_entries')
      .where({ id })
      .update(updateData);
      
    // Return the updated budget entry
    return this.knex('budget_entries')
      .where({ id })
      .first();
  }

  async deleteBudgetEntry(id) {
    // Check if the budget entry exists
    const budgetEntry = await this.knex('budget_entries')
      .where({ id })
      .first();
      
    if (!budgetEntry) {
      return false;
    }
    
    // Delete the budget entry
    await this.knex('budget_entries')
      .where({ id })
      .delete();
      
    return true;
  }
}

module.exports = BudgetAPI; 