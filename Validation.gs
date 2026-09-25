/**
 * Validation.gs
 * Input validation and sanitization helpers.
 */

function validateAccount_(account) {
  const errors = [];
  if (!account || !account.name || !String(account.name).trim()) errors.push('Account name is required');
  if (!account || !account.type || !CONFIG.ACCOUNT_TYPES.includes(account.type)) errors.push('Account type is invalid');
  if (!account || !account.currency || !CONFIG.CURRENCIES.includes(account.currency)) errors.push('Currency is invalid');
  return { valid: errors.length === 0, errors: errors };
}

function validateCategory_(category) {
  const errors = [];
  if (!category || !category.name || !String(category.name).trim()) errors.push('Category name is required');
  if (!category || !category.type || !CONFIG.CATEGORY_TYPES.includes(category.type)) errors.push('Category type is invalid');
  return { valid: errors.length === 0, errors: errors };
}

function validateTransaction_(transaction) {
  const errors = [];
  if (!transaction || !transaction.date) errors.push('Transaction date is required');
  if (!transaction || !transaction.type || !CONFIG.TRANSACTION_TYPES.includes(transaction.type)) errors.push('Transaction type is invalid');
  if (!transaction || !transaction.amount || parseFloat(transaction.amount) <= 0) errors.push('Transaction amount must be greater than zero');
  if (!transaction || !transaction.account_id) errors.push('Account is required');
  return { valid: errors.length === 0, errors: errors };
}

function validateBudget_(budget) {
  const errors = [];
  if (!budget || !budget.category_id) errors.push('Category is required');
  if (!budget || !budget.month) errors.push('Month is required');
  if (!budget || !budget.amount || parseFloat(budget.amount) <= 0) errors.push('Budget amount must be greater than zero');
  return { valid: errors.length === 0, errors: errors };
}

function validateSavingsGoal_(goal) {
  const errors = [];
  if (!goal || !goal.name || !String(goal.name).trim()) errors.push('Goal name is required');
  if (!goal || !goal.target_amount || parseFloat(goal.target_amount) <= 0) errors.push('Target amount must be greater than zero');
  return { valid: errors.length === 0, errors: errors };
}

function validateRecurring_(recurring) {
  const errors = [];
  if (!recurring || !recurring.name || !String(recurring.name).trim()) errors.push('Recurring name is required');
  if (!recurring || !recurring.amount || parseFloat(recurring.amount) <= 0) errors.push('Amount must be greater than zero');
  if (!recurring || !recurring.frequency || !CONFIG.FREQUENCIES.includes(recurring.frequency)) errors.push('Frequency is invalid');
  return { valid: errors.length === 0, errors: errors };
}

function validateProperty_(property) {
  const errors = [];
  if (!property || !property.name || !String(property.name).trim()) errors.push('Property name is required');
  return { valid: errors.length === 0, errors: errors };
}

function validateRoom_(room) {
  const errors = [];
  if (!room || !room.name || !String(room.name).trim()) errors.push('Room name is required');
  if (!room || !room.property_id) errors.push('Property is required');
  return { valid: errors.length === 0, errors: errors };
}

function validateBooking_(booking) {
  const errors = [];
  if (!booking || !booking.room_id) errors.push('Room is required');
  if (!booking || !booking.guest || !String(booking.guest).trim()) errors.push('Guest name is required');
  if (!booking || !booking.check_in) errors.push('Check-in date is required');
  if (!booking || !booking.check_out) errors.push('Check-out date is required');
  return { valid: errors.length === 0, errors: errors };
}
