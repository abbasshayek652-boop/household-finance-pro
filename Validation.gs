/**
 * Validation Module
 * All validation logic for data integrity
 */

/**
 * Validate account data
 * @param {Object} account - Account object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateAccount_(account) {
  const errors = [];
  
  if (!account.name || account.name.trim() === '') {
    errors.push('Account name is required');
  }
  
  if (!account.owner || account.owner.trim() === '') {
    errors.push('Owner is required');
  }
  
  if (!account.currency || !CONFIG.CURRENCIES.includes(account.currency)) {
    errors.push('Valid currency is required');
  }
  
  if (!account.type || !CONFIG.ACCOUNT_TYPES.includes(account.type)) {
    errors.push('Valid account type is required');
  }
  
  if (account.opening_balance !== '' && account.opening_balance !== null) {
    const balance = parseFloat(account.opening_balance);
    if (isNaN(balance)) {
      errors.push('Opening balance must be a valid number');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate category data
 * @param {Object} category - Category object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateCategory_(category) {
  const errors = [];
  
  if (!category.name || category.name.trim() === '') {
    errors.push('Category name is required');
  }
  
  if (!category.type || !CONFIG.CATEGORY_TYPES.includes(category.type)) {
    errors.push('Valid category type is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate transaction data
 * @param {Object} transaction - Transaction object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateTransaction_(transaction) {
  const errors = [];
  
  if (!transaction.date || !isValidDate_(transaction.date)) {
    errors.push('Valid date is required (YYYY-MM-DD)');
  }
  
  if (!transaction.type || !CONFIG.TRANSACTION_TYPES.includes(transaction.type)) {
    errors.push('Valid transaction type is required');
  }
  
  if (!transaction.entity || transaction.entity.trim() === '') {
    errors.push('Entity is required');
  }
  
  if (!transaction.category_id || !isValidUUID_(transaction.category_id)) {
    errors.push('Valid category is required');
  }
  
  if (!transaction.account_id || !isValidUUID_(transaction.account_id)) {
    errors.push('Valid account is required');
  }
  
  if (transaction.amount === '' || transaction.amount === null) {
    errors.push('Amount is required');
  } else {
    const amount = parseFloat(transaction.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    }
  }
  
  if (!transaction.currency || !CONFIG.CURRENCIES.includes(transaction.currency)) {
    errors.push('Valid currency is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate budget data
 * @param {Object} budget - Budget object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateBudget_(budget) {
  const errors = [];
  
  if (!budget.category_id || !isValidUUID_(budget.category_id)) {
    errors.push('Valid category is required');
  }
  
  if (!budget.month || !/^\d{4}-\d{2}$/.test(budget.month)) {
    errors.push('Valid month is required (YYYY-MM)');
  }
  
  if (budget.amount === '' || budget.amount === null) {
    errors.push('Budget amount is required');
  } else {
    const amount = parseFloat(budget.amount);
    if (isNaN(amount) || amount < 0) {
      errors.push('Budget amount must be a non-negative number');
    }
  }
  
  if (!budget.currency || !CONFIG.CURRENCIES.includes(budget.currency)) {
    errors.push('Valid currency is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate savings goal data
 * @param {Object} goal - Savings goal object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateSavingsGoal_(goal) {
  const errors = [];
  
  if (!goal.name || goal.name.trim() === '') {
    errors.push('Goal name is required');
  }
  
  if (goal.target_amount === '' || goal.target_amount === null) {
    errors.push('Target amount is required');
  } else {
    const amount = parseFloat(goal.target_amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Target amount must be a positive number');
    }
  }
  
  if (goal.current_amount !== '' && goal.current_amount !== null) {
    const amount = parseFloat(goal.current_amount);
    if (isNaN(amount) || amount < 0) {
      errors.push('Current amount must be a non-negative number');
    }
  }
  
  if (!goal.currency || !CONFIG.CURRENCIES.includes(goal.currency)) {
    errors.push('Valid currency is required');
  }
  
  if (goal.deadline && !isValidDate_(goal.deadline)) {
    errors.push('Valid deadline date required (YYYY-MM-DD)');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate recurring transaction data
 * @param {Object} recurring - Recurring transaction object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateRecurring_(recurring) {
  const errors = [];
  
  if (!recurring.name || recurring.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!recurring.type || !CONFIG.TRANSACTION_TYPES.includes(recurring.type)) {
    errors.push('Valid type is required');
  }
  
  if (!recurring.entity || recurring.entity.trim() === '') {
    errors.push('Entity is required');
  }
  
  if (!recurring.account_id || !isValidUUID_(recurring.account_id)) {
    errors.push('Valid account is required');
  }
  
  if (!recurring.category_id || !isValidUUID_(recurring.category_id)) {
    errors.push('Valid category is required');
  }
  
  if (recurring.amount === '' || recurring.amount === null) {
    errors.push('Amount is required');
  } else {
    const amount = parseFloat(recurring.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    }
  }
  
  if (!recurring.currency || !CONFIG.CURRENCIES.includes(recurring.currency)) {
    errors.push('Valid currency is required');
  }
  
  if (!recurring.frequency || !CONFIG.FREQUENCIES.includes(recurring.frequency)) {
    errors.push('Valid frequency is required');
  }
  
  if (!recurring.next_run_date || !isValidDate_(recurring.next_run_date)) {
    errors.push('Valid next run date required (YYYY-MM-DD)');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate property data
 * @param {Object} property - Property object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateProperty_(property) {
  const errors = [];
  
  if (!property.name || property.name.trim() === '') {
    errors.push('Property name is required');
  }
  
  if (!property.address || property.address.trim() === '') {
    errors.push('Address is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate room data
 * @param {Object} room - Room object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateRoom_(room) {
  const errors = [];
  
  if (!room.property_id || !isValidUUID_(room.property_id)) {
    errors.push('Valid property is required');
  }
  
  if (!room.name || room.name.trim() === '') {
    errors.push('Room name is required');
  }
  
  if (!room.status || !CONFIG.ROOM_STATUS.includes(room.status)) {
    errors.push('Valid status is required');
  }
  
  if (room.default_nightly_rate && room.default_nightly_rate !== '') {
    const rate = parseFloat(room.default_nightly_rate);
    if (isNaN(rate) || rate < 0) {
      errors.push('Default nightly rate must be a non-negative number');
    }
  }
  
  if (room.currency && room.currency !== '' && !CONFIG.CURRENCIES.includes(room.currency)) {
    errors.push('Valid currency is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate booking data
 * @param {Object} booking - Booking object to validate
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateBooking_(booking) {
  const errors = [];
  
  if (!booking.room_id || !isValidUUID_(booking.room_id)) {
    errors.push('Valid room is required');
  }
  
  if (!booking.guest || booking.guest.trim() === '') {
    errors.push('Guest name is required');
  }
  
  if (!booking.check_in || !isValidDate_(booking.check_in)) {
    errors.push('Valid check-in date required (YYYY-MM-DD)');
  }
  
  if (!booking.check_out || !isValidDate_(booking.check_out)) {
    errors.push('Valid check-out date required (YYYY-MM-DD)');
  }
  
  if (booking.check_in && booking.check_out) {
    if (compareDates_(booking.check_in, booking.check_out) >= 0) {
      errors.push('Check-out date must be after check-in date');
    }
  }
  
  if (booking.amount_received === '' || booking.amount_received === null) {
    errors.push('Amount received is required');
  } else {
    const amount = parseFloat(booking.amount_received);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount received must be a positive number');
    }
  }
  
  if (!booking.currency || !CONFIG.CURRENCIES.includes(booking.currency)) {
    errors.push('Valid currency is required');
  }
  
  if (!booking.status || !CONFIG.BOOKING_STATUS.includes(booking.status)) {
    errors.push('Valid status is required');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Check if date is in valid YYYY-MM-DD format
 * @param {string} date - Date to validate
 * @returns {boolean} True if valid
 */
function isValidDate_(date) {
  if (!date || typeof date !== 'string') return false;
  
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  
  // Check if it's a valid date
  const d = new Date(date + 'T00:00:00Z');
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Check if account exists by ID
 * @param {string} accountId - Account ID
 * @param {Array} accounts - Array of accounts
 * @returns {boolean} True if exists
 */
function accountExists_(accountId, accounts) {
  if (!accounts) return false;
  return accounts.some(a => a.id === accountId && !a.archived);
}

/**
 * Check if category exists by ID
 * @param {string} categoryId - Category ID
 * @param {Array} categories - Array of categories
 * @returns {boolean} True if exists
 */
function categoryExists_(categoryId, categories) {
  if (!categories) return false;
  return categories.some(c => c.id === categoryId && !c.archived);
}

/**
 * Check if property exists by ID
 * @param {string} propertyId - Property ID
 * @param {Array} properties - Array of properties
 * @returns {boolean} True if exists
 */
function propertyExists_(propertyId, properties) {
  if (!properties) return false;
  return properties.some(p => p.id === propertyId && !p.archived);
}

/**
 * Check if room exists by ID
 * @param {string} roomId - Room ID
 * @param {Array} rooms - Array of rooms
 * @returns {boolean} True if exists
 */
function roomExists_(roomId, rooms) {
  if (!rooms) return false;
  return rooms.some(r => r.id === roomId && !r.archived);
}

/**
 * Check if transactions reference an account
 * @param {string} accountId - Account ID
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Transactions that reference the account
 */
function getTransactionsForAccount_(accountId, transactions) {
  if (!transactions) return [];
  return transactions.filter(t => t.account_id === accountId);
}

/**
 * Check if transactions reference a category
 * @param {string} categoryId - Category ID
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Transactions that reference the category
 */
function getTransactionsForCategory_(categoryId, transactions) {
  if (!transactions) return [];
  return transactions.filter(t => t.category_id === categoryId);
}

/**
 * Check if budgets reference a category
 * @param {string} categoryId - Category ID
 * @param {Array} budgets - Array of budgets
 * @returns {Array} Budgets that reference the category
 */
function getBudgetsForCategory_(categoryId, budgets) {
  if (!budgets) return [];
  return budgets.filter(b => b.category_id === categoryId);
}

/**
 * Check if recurring transactions reference a category
 * @param {string} categoryId - Category ID
 * @param {Array} recurring - Array of recurring transactions
 * @returns {Array} Recurring that reference the category
 */
function getRecurringForCategory_(categoryId, recurring) {
  if (!recurring) return [];
  return recurring.filter(r => r.category_id === categoryId);
}

/**
 * Check if rooms reference a property
 * @param {string} propertyId - Property ID
 * @param {Array} rooms - Array of rooms
 * @returns {Array} Rooms that reference the property
 */
function getRoomsForProperty_(propertyId, rooms) {
  if (!rooms) return [];
  return rooms.filter(r => r.property_id === propertyId);
}

/**
 * Check if bookings reference a room
 * @param {string} roomId - Room ID
 * @param {Array} bookings - Array of bookings
 * @returns {Array} Bookings that reference the room
 */
function getBookingsForRoom_(roomId, bookings) {
  if (!bookings) return [];
  return bookings.filter(b => b.room_id === roomId);
}
