/**
 * Reports.gs
 * Financial and rental reporting helpers.
 */

function getBudgetReport_(month, categories, budgets, transactions) {
  const monthBudgets = (budgets || []).filter((b) => b.month === month);
  const report = (monthBudgets || []).map((budget) => {
    const category = (categories || []).find((c) => c.id === budget.category_id) || {};
    const spent = (transactions || []).filter((t) => t.category_id === budget.category_id && t.date && t.date.startsWith(month)).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    return {
      categoryId: budget.category_id,
      categoryName: category.name || 'Unknown',
      month: month,
      budgetAmount: parseFloat(budget.amount) || 0,
      spentAmount: spent,
      remaining: (parseFloat(budget.amount) || 0) - spent
    };
  });

  return {
    month: month,
    report: report
  };
}

function getMonthlyCashFlow_(transactions, months = 12) {
  const data = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = monthDate.getFullYear();
    const month = String(monthDate.getMonth() + 1).padStart(2, '0');
    const monthKey = year + '-' + month;

    const income = (transactions || []).filter((t) => t.date && t.date.startsWith(monthKey) && t.type === 'Income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const expenses = (transactions || []).filter((t) => t.date && t.date.startsWith(monthKey) && t.type === 'Expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    data.push({ month: monthKey, income: income, expenses: expenses, net: income - expenses });
  }

  return data;
}

function getExpenseBreakdown_(transactions, categories) {
  const totals = {};
  (transactions || []).filter((t) => t.type === 'Expense').forEach((t) => {
    const category = (categories || []).find((c) => c.id === t.category_id);
    const key = category ? category.name : 'Uncategorized';
    totals[key] = (totals[key] || 0) + (parseFloat(t.amount) || 0);
  });

  return Object.keys(totals).map((name) => ({ name: name, total: totals[name] }));
}

function getIncomeBreakdown_(transactions, categories) {
  const totals = {};
  (transactions || []).filter((t) => t.type === 'Income').forEach((t) => {
    const category = (categories || []).find((c) => c.id === t.category_id);
    const key = category ? category.name : 'Uncategorized';
    totals[key] = (totals[key] || 0) + (parseFloat(t.amount) || 0);
  });

  return Object.keys(totals).map((name) => ({ name: name, total: totals[name] }));
}

function getNetWorthTrend_(accounts, transactions) {
  const result = [];
  const ordered = (transactions || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  let running = (accounts || []).reduce((sum, account) => sum + (parseFloat(account.opening_balance) || 0), 0);

  ordered.forEach((txn) => {
    if (txn.type === 'Income' || txn.type === 'Savings') running += (parseFloat(txn.amount) || 0);
    if (txn.type === 'Expense') running -= (parseFloat(txn.amount) || 0);
    result.push({ date: txn.date, netWorth: running });
  });

  return result;
}

function getSavingsGoalsProgress_(savingsGoals) {
  return (savingsGoals || []).map((goal) => {
    const target = parseFloat(goal.target_amount) || 0;
    const current = parseFloat(goal.current_amount) || 0;
    const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return {
      id: goal.id,
      name: goal.name,
      targetAmount: target,
      currentAmount: current,
      percent: percent,
      remaining: Math.max(target - current, 0)
    };
  });
}
