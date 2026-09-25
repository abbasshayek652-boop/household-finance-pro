/**
 * Finance Module
 * Core financial operations and calculations
 */

/**
 * Get financial state for dashboard
 * @returns {Object} Financial state
 */
function getFinancialState_() {
  const snapshot = loadDatabaseSnapshot_();
  
  const accountsActive = snapshot.accounts.filter(a => !a.archived);
  const categoriesActive = snapshot.categories.filter(c => !c.archived);
  const transactionsAll = snapshot.transactions || [];
  const budgetsActive = snapshot.budgets.filter(b => !b.archived);
  const savingsActive = snapshot.savingsGoals.filter(g => !g.archived);
  const recurringActive = snapshot.recurring.filter(r => !r.archived);
  
  return {
    accounts: accountsActive,
    categories: categoriesActive,
    transactions: transactionsAll,
    budgets: budgetsActive,
    savingsGoals: savingsActive,
    recurring: recurringActive,
    metadata: snapshot.metadata
  };
}

/**
 * Calculate dashboard metrics
 * @param {Array} transactions - Array of transactions
 * @param {Array} accounts - Array of accounts
 * @param {Object} metadata - Metadata object with exchange rates
 * @returns {Object} Dashboard metrics
 */
function calculateDashboardMetrics_(transactions, accounts, metadata) {
  if (!transactions) transactions = [];
  if (!accounts) accounts = [];
  
  const baseCurrency = metadata.base_currency || 'EUR';
  
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavings = 0;
  
  // Separate transactions by type
  transactions.forEach(t => {
    const amount = parseFloat(t.amount) || 0;
    
    // Only include if currency matches or can be converted
    // For now, accumulate by type
    if (t.type === 'Income') {
      totalIncome += amount;
    } else if (t.type === 'Expense') {
      totalExpenses += amount;
    } else if (t.type === 'Savings') {
      totalSavings += amount;
    }
  });
  
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  
  // Calculate account balances
  const accountBalances = calculateAccountBalances_(accounts, transactions);
  
  // Get recent transactions
  const recentTransactions = transactions
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 10);
  
  return {
    totalIncome: totalIncome,
    totalExpenses: totalExpenses,
    netBalance: netBalance,
    totalSavings: totalSavings,
    savingsRate: savingsRate,
    baseCurrency: baseCurrency,
    accountBalances: accountBalances,
    recentTransactions: recentTransactions,
    transactionCount: transactions.length
  };
}

/**
 * Calculate account balances
 * @param {Array} accounts - Array of accounts
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Accounts with calculated balances
 */
function calculateAccountBalances_(accounts, transactions) {
  if (!accounts) return [];
  if (!transactions) transactions = [];
  
  return accounts.map(account => {
    const openingBalance = parseFloat(account.opening_balance) || 0;
    
    // Calculate transactions for this account
    const accountTransactions = transactions.filter(t => t.account_id === account.id);
    
    let balance = openingBalance;
    accountTransactions.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      
      if (t.type === 'Income' || t.type === 'Savings') {
        balance += amount;
      } else if (t.type === 'Expense') {
        balance -= amount;
      }
    });
    
    return {
      ...account,
      balance: balance,
      transactionCount: accountTransactions.length
    };
  });
}

/**
 * Create a new account
 * @param {Object} account - Account data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createAccount_(account) {
  const validation = validateAccount_(account);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('account_write', 5000);
  try {
    const newAccount = addRecord_(CONFIG.SHEETS.ACCOUNTS, account, CONFIG.HEADERS.ACCOUNTS);
    
    logAudit_('CREATE', 'Account', newAccount.id, { name: newAccount.name });
    invalidateFinancialCache_();
    
    return { success: true, data: newAccount };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update an account
 * @param {string} accountId - Account ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateAccount_(accountId, updates) {
  const validation = validateAccount_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('account_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.ACCOUNTS, accountId, updates, CONFIG.HEADERS.ACCOUNTS);
    
    if (updated) {
      logAudit_('UPDATE', 'Account', accountId, { changes: updates });
      invalidateFinancialCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Account not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Archive an account
 * @param {string} accountId - Account ID
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function archiveAccount_(accountId) {
  const lock = acquireLock_('account_write', 5000);
  try {
    const snapshot = loadDatabaseSnapshot_();
    const references = getTransactionsForAccount_(accountId, snapshot.transactions);
    
    if (references.length > 0) {
      return {
        success: false,
        errors: ['Account has ' + references.length + ' transaction(s). Archive historical transactions first.']
      };
    }
    
    const archived = archiveRecord_(CONFIG.SHEETS.ACCOUNTS, accountId, CONFIG.HEADERS.ACCOUNTS);
    
    if (archived) {
      logAudit_('ARCHIVE', 'Account', accountId, {});
      invalidateFinancialCache_();
      return { success: true, data: archived };
    }
    
    return { success: false, errors: ['Account not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete an account permanently
 * @param {string} accountId - Account ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteAccount_(accountId) {
  const lock = acquireLock_('account_write', 5000);
  try {
    const snapshot = loadDatabaseSnapshot_();
    const references = getTransactionsForAccount_(accountId, snapshot.transactions);
    
    if (references.length > 0) {
      return {
        success: false,
        errors: ['Cannot delete account with ' + references.length + ' transaction(s).']
      };
    }
    
    if (deleteRecord_(CONFIG.SHEETS.ACCOUNTS, accountId)) {
      logAudit_('DELETE', 'Account', accountId, {});
      invalidateFinancialCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Account not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Create a new category
 * @param {Object} category - Category data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createCategory_(category) {
  const validation = validateCategory_(category);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('category_write', 5000);
  try {
    const newCategory = addRecord_(CONFIG.SHEETS.CATEGORIES, category, CONFIG.HEADERS.CATEGORIES);
    
    logAudit_('CREATE', 'Category', newCategory.id, { name: newCategory.name });
    invalidateFinancialCache_();
    
    return { success: true, data: newCategory };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update a category
 * @param {string} categoryId - Category ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateCategory_(categoryId, updates) {
  const validation = validateCategory_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('category_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.CATEGORIES, categoryId, updates, CONFIG.HEADERS.CATEGORIES);
    
    if (updated) {
      logAudit_('UPDATE', 'Category', categoryId, { changes: updates });
      invalidateFinancialCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Category not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Archive a category
 * @param {string} categoryId - Category ID
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function archiveCategory_(categoryId) {
  const lock = acquireLock_('category_write', 5000);
  try {
    const snapshot = loadDatabaseSnapshot_();
    const transactionRefs = getTransactionsForCategory_(categoryId, snapshot.transactions);
    const budgetRefs = getBudgetsForCategory_(categoryId, snapshot.budgets);
    const recurringRefs = getRecurringForCategory_(categoryId, snapshot.recurring);
    
    const totalRefs = transactionRefs.length + budgetRefs.length + recurringRefs.length;
    
    if (totalRefs > 0) {
      return {
        success: false,
        errors: ['Category has references (' + totalRefs + '). Archive related items first.']
      };
    }
    
    const archived = archiveRecord_(CONFIG.SHEETS.CATEGORIES, categoryId, CONFIG.HEADERS.CATEGORIES);
    
    if (archived) {
      logAudit_('ARCHIVE', 'Category', categoryId, {});
      invalidateFinancialCache_();
      return { success: true, data: archived };
    }
    
    return { success: false, errors: ['Category not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete a category permanently
 * @param {string} categoryId - Category ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteCategory_(categoryId) {
  const lock = acquireLock_('category_write', 5000);
  try {
    const snapshot = loadDatabaseSnapshot_();
    const transactionRefs = getTransactionsForCategory_(categoryId, snapshot.transactions);
    const budgetRefs = getBudgetsForCategory_(categoryId, snapshot.budgets);
    const recurringRefs = getRecurringForCategory_(categoryId, snapshot.recurring);
    
    const totalRefs = transactionRefs.length + budgetRefs.length + recurringRefs.length;
    
    if (totalRefs > 0) {
      return {
        success: false,
        errors: ['Cannot delete category with ' + totalRefs + ' reference(s).']
      };
    }
    
    if (deleteRecord_(CONFIG.SHEETS.CATEGORIES, categoryId)) {
      logAudit_('DELETE', 'Category', categoryId, {});
      invalidateFinancialCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Category not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Create a new transaction
 * @param {Object} transaction - Transaction data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createTransaction_(transaction) {
  const validation = validateTransaction_(transaction);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('transaction_write', 5000);
  try {
    const newTransaction = addRecord_(CONFIG.SHEETS.TRANSACTIONS, transaction, CONFIG.HEADERS.TRANSACTIONS);
    
    logAudit_('CREATE', 'Transaction', newTransaction.id, { 
      type: newTransaction.type,
      amount: newTransaction.amount,
      entity: newTransaction.entity
    });
    invalidateFinancialCache_();
    
    return { success: true, data: newTransaction };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update a transaction
 * @param {string} transactionId - Transaction ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateTransaction_(transactionId, updates) {
  const validation = validateTransaction_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('transaction_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.TRANSACTIONS, transactionId, updates, CONFIG.HEADERS.TRANSACTIONS);
    
    if (updated) {
      logAudit_('UPDATE', 'Transaction', transactionId, { changes: updates });
      invalidateFinancialCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Transaction not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete a transaction
 * @param {string} transactionId - Transaction ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteTransaction_(transactionId) {
  const lock = acquireLock_('transaction_write', 5000);
  try {
    if (deleteRecord_(CONFIG.SHEETS.TRANSACTIONS, transactionId)) {
      logAudit_('DELETE', 'Transaction', transactionId, {});
      invalidateFinancialCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Transaction not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Create a new budget
 * @param {Object} budget - Budget data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createBudget_(budget) {
  const validation = validateBudget_(budget);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('budget_write', 5000);
  try {
    const newBudget = addRecord_(CONFIG.SHEETS.BUDGETS, budget, CONFIG.HEADERS.BUDGETS);
    
    logAudit_('CREATE', 'Budget', newBudget.id, { 
      category_id: newBudget.category_id,
      month: newBudget.month
    });
    invalidateFinancialCache_();
    
    return { success: true, data: newBudget };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update a budget
 * @param {string} budgetId - Budget ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateBudget_(budgetId, updates) {
  const validation = validateBudget_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('budget_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.BUDGETS, budgetId, updates, CONFIG.HEADERS.BUDGETS);
    
    if (updated) {
      logAudit_('UPDATE', 'Budget', budgetId, { changes: updates });
      invalidateFinancialCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Budget not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Archive a budget
 * @param {string} budgetId - Budget ID
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function archiveBudget_(budgetId) {
  const lock = acquireLock_('budget_write', 5000);
  try {
    const archived = archiveRecord_(CONFIG.SHEETS.BUDGETS, budgetId, CONFIG.HEADERS.BUDGETS);
    
    if (archived) {
      logAudit_('ARCHIVE', 'Budget', budgetId, {});
      invalidateFinancialCache_();
      return { success: true, data: archived };
    }
    
    return { success: false, errors: ['Budget not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete a budget
 * @param {string} budgetId - Budget ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteBudget_(budgetId) {
  const lock = acquireLock_('budget_write', 5000);
  try {
    if (deleteRecord_(CONFIG.SHEETS.BUDGETS, budgetId)) {
      logAudit_('DELETE', 'Budget', budgetId, {});
      invalidateFinancialCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Budget not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Create a new savings goal
 * @param {Object} goal - Savings goal data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createSavingsGoal_(goal) {
  const validation = validateSavingsGoal_(goal);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('goal_write', 5000);
  try {
    const newGoal = addRecord_(CONFIG.SHEETS.SAVINGS_GOALS, goal, CONFIG.HEADERS.SAVINGS_GOALS);
    
    logAudit_('CREATE', 'SavingsGoal', newGoal.id, { name: newGoal.name });
    invalidateFinancialCache_();
    
    return { success: true, data: newGoal };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update a savings goal
 * @param {string} goalId - Goal ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateSavingsGoal_(goalId, updates) {
  const validation = validateSavingsGoal_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('goal_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.SAVINGS_GOALS, goalId, updates, CONFIG.HEADERS.SAVINGS_GOALS);
    
    if (updated) {
      logAudit_('UPDATE', 'SavingsGoal', goalId, { changes: updates });
      invalidateFinancialCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Savings goal not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Archive a savings goal
 * @param {string} goalId - Goal ID
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function archiveSavingsGoal_(goalId) {
  const lock = acquireLock_('goal_write', 5000);
  try {
    const archived = archiveRecord_(CONFIG.SHEETS.SAVINGS_GOALS, goalId, CONFIG.HEADERS.SAVINGS_GOALS);
    
    if (archived) {
      logAudit_('ARCHIVE', 'SavingsGoal', goalId, {});
      invalidateFinancialCache_();
      return { success: true, data: archived };
    }
    
    return { success: false, errors: ['Savings goal not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete a savings goal
 * @param {string} goalId - Goal ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteSavingsGoal_(goalId) {
  const lock = acquireLock_('goal_write', 5000);
  try {
    if (deleteRecord_(CONFIG.SHEETS.SAVINGS_GOALS, goalId)) {
      logAudit_('DELETE', 'SavingsGoal', goalId, {});
      invalidateFinancialCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Savings goal not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Create a new recurring transaction
 * @param {Object} recurring - Recurring transaction data
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function createRecurring_(recurring) {
  const validation = validateRecurring_(recurring);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('recurring_write', 5000);
  try {
    const newRecurring = addRecord_(CONFIG.SHEETS.RECURRING, recurring, CONFIG.HEADERS.RECURRING);
    
    logAudit_('CREATE', 'Recurring', newRecurring.id, { name: newRecurring.name });
    invalidateFinancialCache_();
    
    return { success: true, data: newRecurring };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Update a recurring transaction
 * @param {string} recurringId - Recurring ID
 * @param {Object} updates - Fields to update
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function updateRecurring_(recurringId, updates) {
  const validation = validateRecurring_(updates);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  const lock = acquireLock_('recurring_write', 5000);
  try {
    const updated = updateRecord_(CONFIG.SHEETS.RECURRING, recurringId, updates, CONFIG.HEADERS.RECURRING);
    
    if (updated) {
      logAudit_('UPDATE', 'Recurring', recurringId, { changes: updates });
      invalidateFinancialCache_();
      return { success: true, data: updated };
    }
    
    return { success: false, errors: ['Recurring transaction not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Archive a recurring transaction
 * @param {string} recurringId - Recurring ID
 * @returns {Object} {success: boolean, data: Object, errors: Array}
 */
function archiveRecurring_(recurringId) {
  const lock = acquireLock_('recurring_write', 5000);
  try {
    const archived = archiveRecord_(CONFIG.SHEETS.RECURRING, recurringId, CONFIG.HEADERS.RECURRING);
    
    if (archived) {
      logAudit_('ARCHIVE', 'Recurring', recurringId, {});
      invalidateFinancialCache_();
      return { success: true, data: archived };
    }
    
    return { success: false, errors: ['Recurring transaction not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Delete a recurring transaction
 * @param {string} recurringId - Recurring ID
 * @returns {Object} {success: boolean, errors: Array}
 */
function deleteRecurring_(recurringId) {
  const lock = acquireLock_('recurring_write', 5000);
  try {
    if (deleteRecord_(CONFIG.SHEETS.RECURRING, recurringId)) {
      logAudit_('DELETE', 'Recurring', recurringId, {});
      invalidateFinancialCache_();
      return { success: true };
    }
    
    return { success: false, errors: ['Recurring transaction not found'] };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Get exchange rate info
 * @returns {Object} Exchange rates data
 */
function getExchangeRateInfo_() {
  const rates = {};
  CONFIG.CURRENCIES.forEach(currency => {
    const key = 'rate_' + currency;
    const value = getMetaValue_(key);
    rates[currency] = value ? parseFloat(value) : (CONFIG.DEFAULT_EXCHANGE_RATES[currency] || null);
  });
  
  return {
    baseCurrency: getMetaValue_('base_currency') || 'EUR',
    rates: rates
  };
}

/**
 * Set exchange rate
 * @param {string} currency - Currency code
 * @param {number} rate - Exchange rate
 * @returns {Object} {success: boolean}
 */
function setExchangeRate_(currency, rate) {
  if (!CONFIG.CURRENCIES.includes(currency)) {
    return { success: false, errors: ['Invalid currency'] };
  }
  
  const rateNum = parseFloat(rate);
  if (isNaN(rateNum) || rateNum <= 0) {
    return { success: false, errors: ['Exchange rate must be a positive number'] };
  }
  
  const lock = acquireLock_('rate_write', 5000);
  try {
    setMetaValue_('rate_' + currency, rateNum.toString());
    getCache_().remove(CONFIG.CACHE_KEYS.EXCHANGE_RATES);
    
    logAudit_('UPDATE', 'ExchangeRate', currency, { rate: rateNum });
    
    return { success: true };
  } finally {
    releaseLock_(lock);
  }
}

/**
 * Set base currency
 * @param {string} currency - Currency code
 * @returns {Object} {success: boolean}
 */
function setBaseCurrency_(currency) {
  if (!CONFIG.CURRENCIES.includes(currency)) {
    return { success: false, errors: ['Invalid currency'] };
  }
  
  const lock = acquireLock_('rate_write', 5000);
  try {
    setMetaValue_('base_currency', currency);
    invalidateFinancialCache_();
    
    logAudit_('UPDATE', 'BaseCurrency', currency, {});
    
    return { success: true };
  } finally {
    releaseLock_(lock);
  }
}
