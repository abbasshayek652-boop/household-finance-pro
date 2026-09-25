/**
 * Reports Module
 * Financial reporting and analysis
 */

/**
 * Get budget report
 * @param {string} month - Month in YYYY-MM format
 * @param {Array} categories - Array of categories
 * @param {Array} budgets - Array of budgets
 * @param {Array} transactions - Array of transactions
 * @returns {Object} Budget report
 */
function getBudgetReport_(month, categories, budgets, transactions) {
  if (!categories) categories = [];
  if (!budgets) budgets = [];
  if (!transactions) transactions = [];
  
  // Filter budgets for this month
  const monthBudgets = budgets.filter(b => b.month === month && !b.archived);
  
  const report = [];
  
  monthBudgets.forEach(budget => {
    const category = findBy_(categories, 'id', budget.category_id);
    
    // Get transactions for this category and month
    const categoryTransactions = transactions.filter(t => {
      const tMonth = getMonthFromDate_(t.date);
      return t.category_id === budget.category_id && tMonth === month && t.type === 'Expense';
    });
    
    const actual = sumBy_(categoryTransactions, 'amount');
    const budgetAmount = parseFloat(budget.amount) || 0;
    const remaining = budgetAmount - actual;
    const percentage = budgetAmount > 0 ? (actual / budgetAmount) * 100 : 0;
    
    report.push({
      budgetId: budget.id,
      category: category ? category.name : 'Unknown',
      categoryId: budget.category_id,
      currency: budget.currency,
      budget: budgetAmount,
      actual: actual,
      remaining: remaining,
      percentage: percentage,
      status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'ok'
    });
  });
  
  return {
    month: month,
    budgets: report,
    totalBudget: sumBy_(report, 'budget'),
    totalActual: sumBy_(report, 'actual')
  };
}

/**
 * Get monthly cash flow report
 * @param {Array} transactions - Array of transactions
 * @param {number} months - Number of months to include (default 12)
 * @returns {Object} Monthly cash flow data
 */
function getMonthlyCashFlow_(transactions, months = 12) {
  if (!transactions) transactions = [];
  
  const monthlyData = {};
  const today = new Date();
  
  // Initialize months
  for (let i = 0; i < months; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = normalizeDate_(date).substring(0, 7);
    
    if (!monthlyData[month]) {
      monthlyData[month] = {
        month: month,
        income: 0,
        expenses: 0,
        savings: 0,
        net: 0
      };
    }
  }
  
  // Aggregate transactions
  transactions.forEach(t => {
    const month = getMonthFromDate_(t.date);
    if (monthlyData[month]) {
      const amount = parseFloat(t.amount) || 0;
      
      if (t.type === 'Income') {
        monthlyData[month].income += amount;
      } else if (t.type === 'Expense') {
        monthlyData[month].expenses += amount;
      } else if (t.type === 'Savings') {
        monthlyData[month].savings += amount;
      }
    }
  });
  
  // Calculate net
  Object.keys(monthlyData).forEach(month => {
    monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
  });
  
  // Sort by month descending
  const sorted = Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
  
  return sorted;
}

/**
 * Get expense breakdown by category
 * @param {Array} transactions - Array of transactions
 * @param {Array} categories - Array of categories
 * @returns {Array} Expense breakdown
 */
function getExpenseBreakdown_(transactions, categories) {
  if (!transactions) transactions = [];
  if (!categories) categories = [];
  
  // Get all expense transactions
  const expenses = transactions.filter(t => t.type === 'Expense');
  
  // Group by category
  const byCategory = groupBy_(expenses, 'category_id');
  
  const breakdown = [];
  
  Object.keys(byCategory).forEach(categoryId => {
    const category = findBy_(categories, 'id', categoryId);
    const categoryExpenses = byCategory[categoryId];
    const total = sumBy_(categoryExpenses, 'amount');
    
    breakdown.push({
      categoryId: categoryId,
      category: category ? category.name : 'Unknown',
      amount: total,
      count: categoryExpenses.length,
      percentage: 0 // Will be calculated after
    });
  });
  
  // Calculate percentages
  const totalExpenses = sumBy_(breakdown, 'amount');
  if (totalExpenses > 0) {
    breakdown.forEach(item => {
      item.percentage = (item.amount / totalExpenses) * 100;
    });
  }
  
  // Sort by amount descending
  breakdown.sort((a, b) => b.amount - a.amount);
  
  return breakdown;
}

/**
 * Get income breakdown by category
 * @param {Array} transactions - Array of transactions
 * @param {Array} categories - Array of categories
 * @returns {Array} Income breakdown
 */
function getIncomeBreakdown_(transactions, categories) {
  if (!transactions) transactions = [];
  if (!categories) categories = [];
  
  // Get all income transactions
  const income = transactions.filter(t => t.type === 'Income');
  
  // Group by category
  const byCategory = groupBy_(income, 'category_id');
  
  const breakdown = [];
  
  Object.keys(byCategory).forEach(categoryId => {
    const category = findBy_(categories, 'id', categoryId);
    const categoryIncome = byCategory[categoryId];
    const total = sumBy_(categoryIncome, 'amount');
    
    breakdown.push({
      categoryId: categoryId,
      category: category ? category.name : 'Unknown',
      amount: total,
      count: categoryIncome.length,
      percentage: 0 // Will be calculated after
    });
  });
  
  // Calculate percentages
  const totalIncome = sumBy_(breakdown, 'amount');
  if (totalIncome > 0) {
    breakdown.forEach(item => {
      item.percentage = (item.amount / totalIncome) * 100;
    });
  }
  
  // Sort by amount descending
  breakdown.sort((a, b) => b.amount - a.amount);
  
  return breakdown;
}

/**
 * Get net worth over time
 * @param {Array} accounts - Array of accounts
 * @param {Array} transactions - Array of transactions
 * @returns {Object} Net worth data
 */
function getNetWorthTrend_(accounts, transactions) {
  if (!accounts) accounts = [];
  if (!transactions) transactions = [];
  
  // Calculate current net worth
  const accountBalances = calculateAccountBalances_(accounts, transactions);
  const currentNetWorth = sumBy_(accountBalances, 'balance');
  
  return {
    currentNetWorth: currentNetWorth,
    accounts: accountBalances,
    accountCount: accounts.length
  };
}

/**
 * Get savings goals progress
 * @param {Array} goals - Array of savings goals
 * @returns {Array} Goals with progress
 */
function getSavingsGoalsProgress_(goals) {
  if (!goals) goals = [];
  
  return goals
    .filter(g => !g.archived)
    .map(goal => {
      const current = parseFloat(goal.current_amount) || 0;
      const target = parseFloat(goal.target_amount) || 0;
      const progress = target > 0 ? (current / target) * 100 : 0;
      const remaining = target - current;
      
      return {
        ...goal,
        progress: progress,
        remaining: remaining,
        completed: progress >= 100
      };
    })
    .sort((a, b) => b.progress - a.progress);
}

/**
 * Get account summary
 * @param {Array} accounts - Array of accounts
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Accounts with balances
 */
function getAccountSummary_(accounts, transactions) {
  const balances = calculateAccountBalances_(accounts, transactions);
  
  // Group by type
  const byType = groupBy_(balances, 'type');
  
  const summary = [];
  
  Object.keys(byType).forEach(type => {
    const typeAccounts = byType[type];
    const totalBalance = sumBy_(typeAccounts, 'balance');
    
    summary.push({
      type: type,
      accounts: typeAccounts,
      totalBalance: totalBalance,
      count: typeAccounts.length
    });
  });
  
  return summary;
}

/**
 * Get transaction history for export
 * @param {Object} filters - Filter options {startDate, endDate, category, account, type}
 * @param {Array} transactions - Array of transactions
 * @param {Array} categories - Array of categories
 * @param {Array} accounts - Array of accounts
 * @returns {Array} Filtered transactions
 */
function getTransactionHistory_(filters, transactions, categories, accounts) {
  if (!transactions) transactions = [];
  
  let filtered = transactions;
  
  // Apply filters
  if (filters.startDate) {
    filtered = filtered.filter(t => compareDates_(t.date, filters.startDate) >= 0);
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(t => compareDates_(t.date, filters.endDate) <= 0);
  }
  
  if (filters.category) {
    filtered = filtered.filter(t => t.category_id === filters.category);
  }
  
  if (filters.account) {
    filtered = filtered.filter(t => t.account_id === filters.account);
  }
  
  if (filters.type) {
    filtered = filtered.filter(t => t.type === filters.type);
  }
  
  // Enrich with names
  return filtered.map(t => {
    const category = findBy_(categories, 'id', t.category_id);
    const account = findBy_(accounts, 'id', t.account_id);
    
    return {
      ...t,
      categoryName: category ? category.name : 'Unknown',
      accountName: account ? account.name : 'Unknown'
    };
  }).sort((a, b) => compareDates_(b.date, a.date));
}
