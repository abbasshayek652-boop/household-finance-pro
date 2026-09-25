/**
 * Finance.gs
 * Household finance data and CRUD operations.
 */

function getFinancialState_() {
  const snapshot = loadDatabaseSnapshot_();
  return {
    accounts: (snapshot.accounts || []).filter((a) => !a.archived),
    categories: (snapshot.categories || []).filter((c) => !c.archived),
    transactions: snapshot.transactions || [],
    budgets: (snapshot.budgets || []).filter((b) => !b.archived),
    savingsGoals: (snapshot.savingsGoals || []).filter((g) => !g.archived),
    recurring: (snapshot.recurring || []).filter((r) => !r.archived),
    metadata: snapshot.metadata || {}
  };
}

function calculateDashboardMetrics_(transactions, accounts, metadata) {
  const txns = transactions || [];
  const totalIncome = txns.filter((t) => t.type === 'Income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalExpenses = txns.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalSavings = txns.filter((t) => t.type === 'Savings').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  return {
    totalIncome: totalIncome,
    totalExpenses: totalExpenses,
    netBalance: netBalance,
    totalSavings: totalSavings,
    savingsRate: savingsRate,
    baseCurrency: metadata.base_currency || 'EUR',
    transactionCount: txns.length,
    recentTransactions: txns.slice(-10)
  };
}

function calculateAccountBalances_(accounts, transactions) {
  return (accounts || []).map((account) => {
    const opening = parseFloat(account.opening_balance) || 0;
    const accountTxns = (transactions || []).filter((t) => t.account_id === account.id);
    let balance = opening;
    accountTxns.forEach((txn) => {
      const amount = parseFloat(txn.amount) || 0;
      if (txn.type === 'Income' || txn.type === 'Savings') balance += amount;
      else if (txn.type === 'Expense') balance -= amount;
    });
    return Object.assign({}, account, { balance: balance, transactionCount: accountTxns.length });
  });
}

function createAccount_(account) {
  const validation = validateAccount_(account);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('Accounts', account, ['id', 'name', 'owner', 'currency', 'type', 'opening_balance', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'Account', result.id, { name: result.name });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Failed to create account'] };
}

function updateAccount_(accountId, updates) {
  const validation = validateAccount_(updates);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = updateRecord_('Accounts', accountId, updates, ['id', 'name', 'owner', 'currency', 'type', 'opening_balance', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'Account', accountId, { changes: updates });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Account not found'] };
}

function archiveAccount_(accountId) {
  const result = archiveRecord_('Accounts', accountId, ['id', 'name', 'owner', 'currency', 'type', 'opening_balance', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('ARCHIVE', 'Account', accountId, {});
    return { success: true, data: result };
  }
  return { success: false, errors: ['Account not found'] };
}

function deleteAccount_(accountId) {
  if (deleteRecord_('Accounts', accountId)) {
    logAudit_('DELETE', 'Account', accountId, {});
    return { success: true };
  }
  return { success: false, errors: ['Account not found'] };
}

function createCategory_(category) {
  const validation = validateCategory_(category);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('Categories', category, ['id', 'name', 'type', 'parent_id', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'Category', result.id, { name: result.name });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Failed to create category'] };
}

function updateCategory_(categoryId, updates) {
  const validation = validateCategory_(updates);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = updateRecord_('Categories', categoryId, updates, ['id', 'name', 'type', 'parent_id', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'Category', categoryId, { changes: updates });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Category not found'] };
}

function archiveCategory_(categoryId) {
  const result = archiveRecord_('Categories', categoryId, ['id', 'name', 'type', 'parent_id', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('ARCHIVE', 'Category', categoryId, {});
    return { success: true, data: result };
  }
  return { success: false, errors: ['Category not found'] };
}

function deleteCategory_(categoryId) {
  if (deleteRecord_('Categories', categoryId)) {
    logAudit_('DELETE', 'Category', categoryId, {});
    return { success: true };
  }
  return { success: false, errors: ['Category not found'] };
}

function createTransaction_(transaction) {
  const validation = validateTransaction_(transaction);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('Transactions', transaction, ['id', 'date', 'type', 'entity', 'category_id', 'account_id', 'amount', 'currency', 'notes', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'Transaction', result.id, { type: result.type, amount: result.amount });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Failed to create transaction'] };
}

function updateTransaction_(transactionId, updates) {
  const validation = validateTransaction_(updates);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = updateRecord_('Transactions', transactionId, updates, ['id', 'date', 'type', 'entity', 'category_id', 'account_id', 'amount', 'currency', 'notes', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'Transaction', transactionId, { changes: updates });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Transaction not found'] };
}

function deleteTransaction_(transactionId) {
  if (deleteRecord_('Transactions', transactionId)) {
    logAudit_('DELETE', 'Transaction', transactionId, {});
    return { success: true };
  }
  return { success: false, errors: ['Transaction not found'] };
}

function createBudget_(budget) {
  const validation = validateBudget_(budget);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('Budgets', budget, ['id', 'category_id', 'month', 'amount', 'currency', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'Budget', result.id, { category_id: result.category_id, month: result.month });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Failed to create budget'] };
}

function updateBudget_(budgetId, updates) {
  const validation = validateBudget_(updates);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = updateRecord_('Budgets', budgetId, updates, ['id', 'category_id', 'month', 'amount', 'currency', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'Budget', budgetId, { changes: updates });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Budget not found'] };
}

function archiveBudget_(budgetId) {
  const result = archiveRecord_('Budgets', budgetId, ['id', 'category_id', 'month', 'amount', 'currency', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('ARCHIVE', 'Budget', budgetId, {});
    return { success: true, data: result };
  }
  return { success: false, errors: ['Budget not found'] };
}

function deleteBudget_(budgetId) {
  if (deleteRecord_('Budgets', budgetId)) {
    logAudit_('DELETE', 'Budget', budgetId, {});
    return { success: true };
  }
  return { success: false, errors: ['Budget not found'] };
}

function createSavingsGoal_(goal) {
  const validation = validateSavingsGoal_(goal);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('SavingsGoals', goal, ['id', 'name', 'target_amount', 'current_amount', 'currency', 'deadline', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'SavingsGoal', result.id, { name: result.name });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Failed to create savings goal'] };
}

function updateSavingsGoal_(goalId, updates) {
  const validation = validateSavingsGoal_(updates);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = updateRecord_('SavingsGoals', goalId, updates, ['id', 'name', 'target_amount', 'current_amount', 'currency', 'deadline', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'SavingsGoal', goalId, { changes: updates });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Savings goal not found'] };
}

function archiveSavingsGoal_(goalId) {
  const result = archiveRecord_('SavingsGoals', goalId, ['id', 'name', 'target_amount', 'current_amount', 'currency', 'deadline', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('ARCHIVE', 'SavingsGoal', goalId, {});
    return { success: true, data: result };
  }
  return { success: false, errors: ['Savings goal not found'] };
}

function deleteSavingsGoal_(goalId) {
  if (deleteRecord_('SavingsGoals', goalId)) {
    logAudit_('DELETE', 'SavingsGoal', goalId, {});
    return { success: true };
  }
  return { success: false, errors: ['Savings goal not found'] };
}

function createRecurring_(recurring) {
  const validation = validateRecurring_(recurring);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = addRecord_('Recurring', recurring, ['id', 'name', 'type', 'entity', 'account_id', 'category_id', 'amount', 'currency', 'frequency', 'next_run_date', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('CREATE', 'Recurring', result.id, { name: result.name });
    return { success: true, data: result };
  }

  return { success: false, errors: ['Failed to create recurring item'] };
}

function updateRecurring_(recurringId, updates) {
  const validation = validateRecurring_(updates);
  if (!validation.valid) return { success: false, errors: validation.errors };

  const result = updateRecord_('Recurring', recurringId, updates, ['id', 'name', 'type', 'entity', 'account_id', 'category_id', 'amount', 'currency', 'frequency', 'next_run_date', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('UPDATE', 'Recurring', recurringId, { changes: updates });
    return { success: true, data: result };
  }
  return { success: false, errors: ['Recurring item not found'] };
}

function archiveRecurring_(recurringId) {
  const result = archiveRecord_('Recurring', recurringId, ['id', 'name', 'type', 'entity', 'account_id', 'category_id', 'amount', 'currency', 'frequency', 'next_run_date', 'notes', 'archived', 'created_at', 'updated_at']);
  if (result) {
    logAudit_('ARCHIVE', 'Recurring', recurringId, {});
    return { success: true, data: result };
  }
  return { success: false, errors: ['Recurring item not found'] };
}

function deleteRecurring_(recurringId) {
  if (deleteRecord_('Recurring', recurringId)) {
    logAudit_('DELETE', 'Recurring', recurringId, {});
    return { success: true };
  }
  return { success: false, errors: ['Recurring item not found'] };
}

function getExchangeRateInfo_() {
  const rates = {};
  ['EUR', 'USD', 'LBP'].forEach((currency) => {
    rates[currency] = getMetaValue_('rate_' + currency) || CONFIG.DEFAULT_EXCHANGE_RATES[currency] || null;
  });
  return {
    baseCurrency: getMetaValue_('base_currency') || 'EUR',
    rates: rates
  };
}

function setExchangeRate_(currency, rate) {
  if (!['EUR', 'USD', 'LBP'].includes(currency)) return { success: false, errors: ['Invalid currency'] };
  const numericRate = parseFloat(rate);
  if (isNaN(numericRate) || numericRate <= 0) return { success: false, errors: ['Rate must be a positive number'] };
  setMetaValue_('rate_' + currency, numericRate.toString());
  logAudit_('UPDATE', 'ExchangeRate', currency, { rate: numericRate });
  return { success: true };
}

function setBaseCurrency_(currency) {
  if (!['EUR', 'USD', 'LBP'].includes(currency)) return { success: false, errors: ['Invalid currency'] };
  setMetaValue_('base_currency', currency);
  logAudit_('UPDATE', 'BaseCurrency', currency, {});
  return { success: true };
}
