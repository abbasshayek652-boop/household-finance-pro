/**
 * Code.gs
 * Main entry point for the Household Finance Pro Google Apps Script app.
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setWidth(1400)
    .setHeight(900)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function initializeApp() {
  setupDatabase_();
  return { success: true, message: 'Application initialized' };
}

function getApplicationState() {
  const financialState = getFinancialState_();
  const rentalState = getRentalState_();

  const dashboardMetrics = calculateDashboardMetrics_(
    financialState.transactions,
    financialState.accounts,
    financialState.metadata
  );

  const rentalSummary = calculateRentalSummary_(rentalState.bookings, rentalState.rooms);

  return {
    finance: {
      accounts: toClientSafe_(financialState.accounts),
      categories: toClientSafe_(financialState.categories),
      transactions: toClientSafe_(financialState.transactions),
      budgets: toClientSafe_(financialState.budgets),
      savingsGoals: toClientSafe_(financialState.savingsGoals),
      recurring: toClientSafe_(financialState.recurring),
      dashboard: dashboardMetrics,
      metadata: financialState.metadata
    },
    rental: {
      properties: toClientSafe_(rentalState.properties),
      rooms: toClientSafe_(rentalState.rooms),
      bookings: toClientSafe_(rentalState.bookings),
      summary: rentalSummary
    }
  };
}

function API_createAccount(account) { return createAccount_(account); }
function API_updateAccount(accountId, updates) { return updateAccount_(accountId, updates); }
function API_archiveAccount(accountId) { return archiveAccount_(accountId); }
function API_deleteAccount(accountId) { return deleteAccount_(accountId); }

function API_createCategory(category) { return createCategory_(category); }
function API_updateCategory(categoryId, updates) { return updateCategory_(categoryId, updates); }
function API_archiveCategory(categoryId) { return archiveCategory_(categoryId); }
function API_deleteCategory(categoryId) { return deleteCategory_(categoryId); }

function API_createTransaction(transaction) { return createTransaction_(transaction); }
function API_updateTransaction(transactionId, updates) { return updateTransaction_(transactionId, updates); }
function API_deleteTransaction(transactionId) { return deleteTransaction_(transactionId); }

function API_createBudget(budget) { return createBudget_(budget); }
function API_updateBudget(budgetId, updates) { return updateBudget_(budgetId, updates); }
function API_archiveBudget(budgetId) { return archiveBudget_(budgetId); }
function API_deleteBudget(budgetId) { return deleteBudget_(budgetId); }

function API_createSavingsGoal(goal) { return createSavingsGoal_(goal); }
function API_updateSavingsGoal(goalId, updates) { return updateSavingsGoal_(goalId, updates); }
function API_archiveSavingsGoal(goalId) { return archiveSavingsGoal_(goalId); }
function API_deleteSavingsGoal(goalId) { return deleteSavingsGoal_(goalId); }

function API_createRecurring(recurring) { return createRecurring_(recurring); }
function API_updateRecurring(recurringId, updates) { return updateRecurring_(recurringId, updates); }
function API_archiveRecurring(recurringId) { return archiveRecurring_(recurringId); }
function API_deleteRecurring(recurringId) { return deleteRecurring_(recurringId); }

function API_getExchangeRateInfo() { return getExchangeRateInfo_(); }
function API_setExchangeRate(currency, rate) { return setExchangeRate_(currency, rate); }
function API_setBaseCurrency(currency) { return setBaseCurrency_(currency); }

function API_createProperty(property) { return createProperty_(property); }
function API_updateProperty(propertyId, updates) { return updateProperty_(propertyId, updates); }
function API_archiveProperty(propertyId) { return archiveProperty_(propertyId); }
function API_deleteProperty(propertyId) { return deleteProperty_(propertyId); }

function API_createRoom(room) { return createRoom_(room); }
function API_updateRoom(roomId, updates) { return updateRoom_(roomId, updates); }
function API_archiveRoom(roomId) { return archiveRoom_(roomId); }
function API_deleteRoom(roomId) { return deleteRoom_(roomId); }

function API_createBooking(booking) { return createBooking_(booking); }
function API_updateBooking(bookingId, updates) { return updateBooking_(bookingId, updates); }
function API_deleteBooking(bookingId) { return deleteBooking_(bookingId); }

function API_getBudgetReport(month) {
  const state = getFinancialState_();
  return getBudgetReport_(month, state.categories, state.budgets, state.transactions);
}

function API_getMonthlyCashFlow(months = 12) {
  const state = getFinancialState_();
  return getMonthlyCashFlow_(state.transactions, months);
}

function API_getExpenseBreakdown() {
  const state = getFinancialState_();
  return getExpenseBreakdown_(state.transactions, state.categories);
}

function API_getIncomeBreakdown() {
  const state = getFinancialState_();
  return getIncomeBreakdown_(state.transactions, state.categories);
}

function API_getNetWorthTrend() {
  const state = getFinancialState_();
  return getNetWorthTrend_(state.accounts, state.transactions);
}

function API_getSavingsGoalsProgress() {
  const state = getFinancialState_();
  return getSavingsGoalsProgress_(state.savingsGoals);
}

function API_getAuditLog(limit = 100) {
  return getAuditLog_(limit);
}

function API_getAuditForEntity(entityType, entityId) {
  return getAuditForEntity_(entityType, entityId);
}
