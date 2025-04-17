/**
 * Initial database schema migration for financial transactions
 */
exports.up = function(knex) {
  // Create accounts table
  return knex.schema.createTable('accounts', table => {
    table.string('accountnum').primary();
    table.string('name');
    table.string('type');
    table.timestamps(true, true);
  })
  
  // Create transactions table
  .then(() => {
    return knex.schema.createTable('transactions', table => {
      table.string('transactionID').primary();
      table.string('RECID').notNullable();
      table.string('trans_date_id').notNullable();
      table.string('doc_date_id').notNullable();
      table.string('accountnum').notNullable().references('accountnum').inTable('accounts');
      table.string('journalnum').notNullable();
      table.string('voucher').notNullable();
      table.date('transdate').notNullable();
      table.date('documentdate').notNullable();
      table.text('txt');
      table.decimal('amountcur', 15, 2).notNullable();
      table.string('debit_credit_flag', 1).notNullable();
      table.timestamps(true, true);
      
      // Create indexes for performance
      table.index('accountnum');
      table.index('transdate');
      table.index('RECID');
    });
  })
  
  // Create budget_entries table
  .then(() => {
    return knex.schema.createTable('budget_entries', table => {
      table.increments('id').primary();
      table.string('accountnum').notNullable().references('accountnum').inTable('accounts');
      table.decimal('amount', 15, 2).notNullable();
      table.string('period').notNullable();
      table.text('description');
      table.timestamps(true, true);
      
      // Create index for account lookups
      table.index('accountnum');
    });
  });
};

exports.down = function(knex) {
  // Drop tables in reverse order
  return knex.schema
    .dropTableIfExists('budget_entries')
    .then(() => knex.schema.dropTableIfExists('transactions'))
    .then(() => knex.schema.dropTableIfExists('accounts'));
}; 