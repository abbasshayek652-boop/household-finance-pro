/**
 * Tests.gs
 * Comprehensive test suite for Household Finance Pro
 */

/**
 * Run all tests
 */
function runAllTests() {
  Logger.log('=== STARTING TEST SUITE ===');
  
  testDatabaseSetup();
  testDateNormalization();
  testAccountCRUD();
  testCategoryCRUD();
  testTransactionCRUD();
  testBudgetCRUD();
  testSavingsGoalCRUD();
  testRecurringCRUD();
  testPropertyCRUD();
  testRoomCRUD();
  testBookingCRUD();
  testRentalSeparation();
  testAuditLogging();
  testValidation();
  testFinancialCalculations();
  
  Logger.log('=== TEST SUITE COMPLETE ===');
}

/**
 * Test database setup
 */
function testDatabaseSetup() {
  Logger.log('\n--- Testing Database Setup ---');
  
  const result = setupDatabase_();
  
  if (!result.success) {
    Logger.log('❌ Database setup failed');
    return;
  }
  
  // Check sheets exist
  let allSheetsExist = true;
  Object.values(CONFIG.SHEETS).forEach(sheetName => {
    const sheet = getSheet_(sheetName);
    if (!sheet) {
      Logger.log('❌ Sheet missing: ' + sheetName);
      allSheetsExist = false;
    }
  });
  
  if (allSheetsExist) {
    Logger.log('✓ All sheets created successfully');
  }
}

/**
 * Test date normalization
 */
function testDateNormalization() {
  Logger.log('\n--- Testing Date Normalization ---');
  
  // Test with Date object
  const now = new Date('2026-09-25');
  const normalized = normalizeDate_(now);
  
  if (normalized === '2026-09-25') {
    Logger.log('✓ Date object normalization works');
  } else {
    Logger.log('❌ Date normalization failed: ' + normalized);
  }
  
  // Test with string
  const str = normalizeDate_('2026-09-25');
  if (str === '2026-09-25') {
    Logger.log('✓ String date passthrough works');
  } else {
    Logger.log('❌ String date passthrough failed');
  }
  
  // Test toClientSafe_
  const obj = {
    date: new Date('2026-09-25'),
    nested: {
      dates: [new Date('2026-09-24')]
    }
  };
  
  const safe = toClientSafe_(obj);
  if (safe.date === '2026-09-25' && safe.nested.dates[0] === '2026-09-24') {
    Logger.log('✓ Recursive date normalization works');
  } else {
    Logger.log('❌ Recursive date normalization failed');
  }
}

/**
 * Test Account CRUD
 */
function testAccountCRUD() {
  Logger.log('\n--- Testing Account CRUD ---');
  
  // Create
  const account = {
    name: 'Test Bank Account',
    owner: 'Test Owner',
    currency: 'EUR',
    type: 'Bank',
    opening_balance: 1000
  };
  
  const createResult = createAccount_(account);
  if (!createResult.success) {
    Logger.log('❌ Account creation failed: ' + createResult.errors.join(', '));
    return;
  }
  
  const accountId = createResult.data.id;
  Logger.log('✓ Account created: ' + accountId);
  
  // Update
  const updateResult = updateAccount_(accountId, { 
    opening_balance: 2000 
  });
  
  if (!updateResult.success) {
    Logger.log('❌ Account update failed');
    return;
  }
  Logger.log('✓ Account updated');
  
  // Archive
  const archiveResult = archiveAccount_(accountId);
  if (!archiveResult.success) {
    Logger.log('❌ Account archive failed');
    return;
  }
  Logger.log('✓ Account archived');
  
  // Delete
  const deleteResult = deleteAccount_(accountId);
  if (!deleteResult.success) {
    Logger.log('❌ Account delete failed');
    return;
  }
  Logger.log('✓ Account deleted');
}

/**
 * Test Category CRUD
 */
function testCategoryCRUD() {
  Logger.log('\n--- Testing Category CRUD ---');
  
  const category = {
    name: 'Test Category',
    type: 'Income'
  };
  
  const createResult = createCategory_(category);
  if (!createResult.success) {
    Logger.log('❌ Category creation failed');
    return;
  }
  
  const categoryId = createResult.data.id;
  Logger.log('✓ Category created');
  
  const updateResult = updateCategory_(categoryId, { name: 'Updated Category' });
  if (!updateResult.success) {
    Logger.log('❌ Category update failed');
    return;
  }
  Logger.log('✓ Category updated');
  
  const archiveResult = archiveCategory_(categoryId);
  if (!archiveResult.success) {
    Logger.log('❌ Category archive failed');
    return;
  }
  Logger.log('✓ Category archived');
}

/**
 * Test Transaction CRUD
 */
function testTransactionCRUD() {
  Logger.log('\n--- Testing Transaction CRUD ---');
  
  // Need account and category first
  const account = {
    name: 'Transaction Test Account',
    owner: 'Test',
    currency: 'EUR',
    type: 'Bank',
    opening_balance: 0
  };
  
  const accountRes = createAccount_(account);
  const accountId = accountRes.data.id;
  
  const category = {
    name: 'Transaction Test Category',
    type: 'Income'
  };
  
  const catRes = createCategory_(category);
  const categoryId = catRes.data.id;
  
  // Create transaction
  const transaction = {
    date: '2026-09-25',
    type: 'Income',
    entity: 'Salary',
    category_id: categoryId,
    account_id: accountId,
    amount: 5000,
    currency: 'EUR'
  };
  
  const createResult = createTransaction_(transaction);
  if (!createResult.success) {
    Logger.log('❌ Transaction creation failed');
    return;
  }
  
  const transactionId = createResult.data.id;
  Logger.log('✓ Transaction created');
  
  // Update
  const updateResult = updateTransaction_(transactionId, { amount: 6000 });
  if (!updateResult.success) {
    Logger.log('❌ Transaction update failed');
    return;
  }
  Logger.log('✓ Transaction updated');
  
  // Delete
  const deleteResult = deleteTransaction_(transactionId);
  if (!deleteResult.success) {
    Logger.log('❌ Transaction delete failed');
    return;
  }
  Logger.log('✓ Transaction deleted');
  
  // Cleanup
  deleteAccount_(accountId);
  deleteCategory_(categoryId);
}

/**
 * Test Budget CRUD
 */
function testBudgetCRUD() {
  Logger.log('\n--- Testing Budget CRUD ---');
  
  const category = {
    name: 'Budget Test Category',
    type: 'Expense'
  };
  
  const catRes = createCategory_(category);
  const categoryId = catRes.data.id;
  
  const budget = {
    category_id: categoryId,
    month: '2026-09',
    amount: 500,
    currency: 'EUR'
  };
  
  const createResult = createBudget_(budget);
  if (!createResult.success) {
    Logger.log('❌ Budget creation failed');
    return;
  }
  
  Logger.log('✓ Budget created');
  
  const budgetId = createResult.data.id;
  
  const updateResult = updateBudget_(budgetId, { amount: 600 });
  if (!updateResult.success) {
    Logger.log('❌ Budget update failed');
    return;
  }
  Logger.log('✓ Budget updated');
  
  const archiveResult = archiveBudget_(budgetId);
  if (!archiveResult.success) {
    Logger.log('❌ Budget archive failed');
    return;
  }
  Logger.log('✓ Budget archived');
  
  deleteCategory_(categoryId);
}

/**
 * Test Savings Goal CRUD
 */
function testSavingsGoalCRUD() {
  Logger.log('\n--- Testing Savings Goal CRUD ---');
  
  const goal = {
    name: 'Vacation Fund',
    target_amount: 5000,
    current_amount: 1000,
    currency: 'EUR',
    deadline: '2027-06-30'
  };
  
  const createResult = createSavingsGoal_(goal);
  if (!createResult.success) {
    Logger.log('❌ Savings goal creation failed');
    return;
  }
  
  Logger.log('✓ Savings goal created');
  
  const goalId = createResult.data.id;
  
  const updateResult = updateSavingsGoal_(goalId, { current_amount: 2000 });
  if (!updateResult.success) {
    Logger.log('❌ Savings goal update failed');
    return;
  }
  Logger.log('✓ Savings goal updated');
  
  const archiveResult = archiveSavingsGoal_(goalId);
  if (!archiveResult.success) {
    Logger.log('❌ Savings goal archive failed');
    return;
  }
  Logger.log('✓ Savings goal archived');
}

/**
 * Test Recurring Transaction CRUD
 */
function testRecurringCRUD() {
  Logger.log('\n--- Testing Recurring Transaction CRUD ---');
  
  // Setup account and category
  const account = {
    name: 'Recurring Test Account',
    owner: 'Test',
    currency: 'EUR',
    type: 'Bank',
    opening_balance: 0
  };
  
  const accountRes = createAccount_(account);
  const accountId = accountRes.data.id;
  
  const category = {
    name: 'Recurring Test Category',
    type: 'Expense'
  };
  
  const catRes = createCategory_(category);
  const categoryId = catRes.data.id;
  
  const recurring = {
    name: 'Monthly Rent',
    type: 'Expense',
    entity: 'Landlord',
    account_id: accountId,
    category_id: categoryId,
    amount: 1200,
    currency: 'EUR',
    frequency: 'Monthly',
    next_run_date: '2026-10-01'
  };
  
  const createResult = createRecurring_(recurring);
  if (!createResult.success) {
    Logger.log('❌ Recurring transaction creation failed');
    return;
  }
  
  Logger.log('✓ Recurring transaction created');
  
  const recurringId = createResult.data.id;
  
  const updateResult = updateRecurring_(recurringId, { amount: 1300 });
  if (!updateResult.success) {
    Logger.log('❌ Recurring transaction update failed');
    return;
  }
  Logger.log('✓ Recurring transaction updated');
  
  const archiveResult = archiveRecurring_(recurringId);
  if (!archiveResult.success) {
    Logger.log('❌ Recurring transaction archive failed');
    return;
  }
  Logger.log('✓ Recurring transaction archived');
  
  deleteAccount_(accountId);
  deleteCategory_(categoryId);
}

/**
 * Test Property CRUD
 */
function testPropertyCRUD() {
  Logger.log('\n--- Testing Property CRUD ---');
  
  const property = {
    name: 'Test Property',
    address: '123 Main St'
  };
  
  const createResult = createProperty_(property);
  if (!createResult.success) {
    Logger.log('❌ Property creation failed');
    return;
  }
  
  const propertyId = createResult.data.id;
  Logger.log('✓ Property created');
  
  const updateResult = updateProperty_(propertyId, { 
    address: '456 Oak Ave' 
  });
  
  if (!updateResult.success) {
    Logger.log('❌ Property update failed');
    return;
  }
  Logger.log('✓ Property updated');
  
  const archiveResult = archiveProperty_(propertyId);
  if (!archiveResult.success) {
    Logger.log('❌ Property archive failed');
    return;
  }
  Logger.log('✓ Property archived');
}

/**
 * Test Room CRUD
 */
function testRoomCRUD() {
  Logger.log('\n--- Testing Room CRUD ---');
  
  const property = {
    name: 'Room Test Property',
    address: '789 Pine Rd'
  };
  
  const propRes = createProperty_(property);
  const propertyId = propRes.data.id;
  
  const room = {
    property_id: propertyId,
    name: 'Master Bedroom',
    status: 'Available',
    default_nightly_rate: 100,
    currency: 'EUR'
  };
  
  const createResult = createRoom_(room);
  if (!createResult.success) {
    Logger.log('❌ Room creation failed');
    return;
  }
  
  const roomId = createResult.data.id;
  Logger.log('✓ Room created');
  
  const updateResult = updateRoom_(roomId, { status: 'Occupied' });
  if (!updateResult.success) {
    Logger.log('❌ Room update failed');
    return;
  }
  Logger.log('✓ Room updated');
  
  const archiveResult = archiveRoom_(roomId);
  if (!archiveResult.success) {
    Logger.log('❌ Room archive failed');
    return;
  }
  Logger.log('✓ Room archived');
  
  deleteProperty_(propertyId);
}

/**
 * Test Booking CRUD
 */
function testBookingCRUD() {
  Logger.log('\n--- Testing Booking CRUD ---');
  
  // Setup property and room
  const property = {
    name: 'Booking Test Property',
    address: '999 Elm St'
  };
  
  const propRes = createProperty_(property);
  const propertyId = propRes.data.id;
  
  const room = {
    property_id: propertyId,
    name: 'Guest Room',
    status: 'Available',
    currency: 'EUR'
  };
  
  const roomRes = createRoom_(room);
  const roomId = roomRes.data.id;
  
  const booking = {
    room_id: roomId,
    guest: 'John Doe',
    check_in: '2026-10-01',
    check_out: '2026-10-05',
    amount_received: 400,
    currency: 'EUR',
    status: 'Confirmed'
  };
  
  const createResult = createBooking_(booking);
  if (!createResult.success) {
    Logger.log('❌ Booking creation failed');
    return;
  }
  
  const bookingId = createResult.data.id;
  Logger.log('✓ Booking created');
  
  const updateResult = updateBooking_(bookingId, { 
    status: 'Completed' 
  });
  
  if (!updateResult.success) {
    Logger.log('❌ Booking update failed');
    return;
  }
  Logger.log('✓ Booking updated');
  
  const deleteResult = deleteBooking_(bookingId);
  if (!deleteResult.success) {
    Logger.log('❌ Booking delete failed');
    return;
  }
  Logger.log('✓ Booking deleted');
  
  deleteRoom_(roomId);
  deleteProperty_(propertyId);
}

/**
 * TEST CRITICAL: Rental module is completely separate from household finance
 */
function testRentalSeparation() {
  Logger.log('\n--- Testing Rental Separation from Household Finance ---');
  
  // Create household transaction
  const account = {
    name: 'Separation Test Account',
    owner: 'Test',
    currency: 'EUR',
    type: 'Bank',
    opening_balance: 1000
  };
  
  const accountRes = createAccount_(account);
  const accountId = accountRes.data.id;
  
  const category = {
    name: 'Test Separation Category',
    type: 'Income'
  };
  
  const catRes = createCategory_(category);
  const categoryId = catRes.data.id;
  
  // Get initial household metrics
  const initialState = getFinancialState_();
  const initialIncome = initialState.transactions.reduce((sum, t) => {
    if (t.type === 'Income') return sum + (parseFloat(t.amount) || 0);
    return sum;
  }, 0);
  
  // Create rental property, room, and booking
  const property = {
    name: 'Separation Test Property',
    address: 'Test Address'
  };
  
  const propRes = createProperty_(property);
  const propertyId = propRes.data.id;
  
  const room = {
    property_id: propertyId,
    name: 'Test Room',
    status: 'Available',
    currency: 'EUR'
  };
  
  const roomRes = createRoom_(room);
  const roomId = roomRes.data.id;
  
  const booking = {
    room_id: roomId,
    guest: 'Test Guest',
    check_in: '2026-10-01',
    check_out: '2026-10-05',
    amount_received: 5000,
    currency: 'EUR',
    status: 'Confirmed'
  };
  
  createBooking_(booking);
  
  // Check that household metrics are UNCHANGED
  const afterBookingState = getFinancialState_();
  const afterBookingIncome = afterBookingState.transactions.reduce((sum, t) => {
    if (t.type === 'Income') return sum + (parseFloat(t.amount) || 0);
    return sum;
  }, 0);
  
  if (initialIncome === afterBookingIncome) {
    Logger.log('✓ Booking creation does NOT affect household income');
  } else {
    Logger.log('❌ CRITICAL: Booking creation affected household income!');
  }
  
  // Check that no household transaction was created for the booking
  const bookingTransactions = afterBookingState.transactions.filter(t => 
    t.notes && t.notes.includes('booking')
  );
  
  if (bookingTransactions.length === 0) {
    Logger.log('✓ Booking did NOT create household transaction');
  } else {
    Logger.log('❌ CRITICAL: Booking created household transaction!');
  }
  
  // Cleanup
  deleteProperty_(propertyId);
  deleteAccount_(accountId);
  deleteCategory_(categoryId);
}

/**
 * Test audit logging
 */
function testAuditLogging() {
  Logger.log('\n--- Testing Audit Logging ---');
  
  const category = {
    name: 'Audit Test Category',
    type: 'Expense'
  };
  
  const createResult = createCategory_(category);
  const categoryId = createResult.data.id;
  
  // Get audit log
  const auditLog = getAuditForEntity_('Category', categoryId);
  
  if (auditLog.length > 0 && auditLog[0].action === 'CREATE') {
    Logger.log('✓ Audit logging works');
  } else {
    Logger.log('❌ Audit logging failed');
  }
  
  deleteCategory_(categoryId);
}

/**
 * Test validation
 */
function testValidation() {
  Logger.log('\n--- Testing Validation ---');
  
  // Test invalid account
  const invalidAccount = {
    name: '', // Missing name
    owner: 'Test',
    currency: 'EUR',
    type: 'Bank'
  };
  
  const result = validateAccount_(invalidAccount);
  if (!result.valid && result.errors.length > 0) {
    Logger.log('✓ Account validation catches missing name');
  } else {
    Logger.log('❌ Account validation failed');
  }
  
  // Test invalid category
  const invalidCategory = {
    name: 'Test',
    type: 'InvalidType'
  };
  
  const catResult = validateCategory_(invalidCategory);
  if (!catResult.valid) {
    Logger.log('✓ Category validation catches invalid type');
  } else {
    Logger.log('❌ Category validation failed');
  }
}

/**
 * Test financial calculations
 */
function testFinancialCalculations() {
  Logger.log('\n--- Testing Financial Calculations ---');
  
  // Create test data
  const account = {
    name: 'Calc Test Account',
    owner: 'Test',
    currency: 'EUR',
    type: 'Bank',
    opening_balance: 1000
  };
  
  const accountRes = createAccount_(account);
  const accountId = accountRes.data.id;
  
  const incomeCategory = {
    name: 'Test Income',
    type: 'Income'
  };
  
  const incomeCatRes = createCategory_(incomeCategory);
  const incomeCatId = incomeCatRes.data.id;
  
  const expenseCategory = {
    name: 'Test Expense',
    type: 'Expense'
  };
  
  const expenseCatRes = createCategory_(expenseCategory);
  const expenseCatId = expenseCatRes.data.id;
  
  // Create income transaction
  const income = {
    date: '2026-09-25',
    type: 'Income',
    entity: 'Salary',
    category_id: incomeCatId,
    account_id: accountId,
    amount: 5000,
    currency: 'EUR'
  };
  
  createTransaction_(income);
  
  // Create expense transaction
  const expense = {
    date: '2026-09-25',
    type: 'Expense',
    entity: 'Groceries',
    category_id: expenseCatId,
    account_id: accountId,
    amount: 200,
    currency: 'EUR'
  };
  
  createTransaction_(expense);
  
  // Calculate dashboard metrics
  const state = getFinancialState_();
  const metrics = calculateDashboardMetrics_(
    state.transactions,
    state.accounts,
    state.metadata
  );
  
  if (metrics.totalIncome >= 5000 && metrics.totalExpenses >= 200) {
    Logger.log('✓ Financial calculations work correctly');
  } else {
    Logger.log('❌ Financial calculations failed');
    Logger.log('  Income: ' + metrics.totalIncome + ' (expected >= 5000)');
    Logger.log('  Expenses: ' + metrics.totalExpenses + ' (expected >= 200)');
  }
  
  // Cleanup
  deleteAccount_(accountId);
  deleteCategory_(incomeCatId);
  deleteCategory_(expenseCatId);
}
