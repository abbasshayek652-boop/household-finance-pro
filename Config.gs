/**
 * Config.gs
 * Shared app configuration and constants.
 */

const CONFIG = {
  SHEETS: {
    ACCOUNTS: 'Accounts',
    CATEGORIES: 'Categories',
    TRANSACTIONS: 'Transactions',
    BUDGETS: 'Budgets',
    SAVINGS_GOALS: 'SavingsGoals',
    RECURRING: 'Recurring',
    PROPERTIES: 'Properties',
    ROOMS: 'Rooms',
    BOOKINGS: 'Bookings',
    AUDIT_LOG: 'AuditLog',
    META: 'Meta'
  },
  HEADERS: {
    ACCOUNTS: ['id', 'name', 'owner', 'currency', 'type', 'opening_balance', 'notes', 'archived', 'created_at', 'updated_at'],
    CATEGORIES: ['id', 'name', 'type', 'parent_id', 'notes', 'archived', 'created_at', 'updated_at'],
    TRANSACTIONS: ['id', 'date', 'type', 'entity', 'category_id', 'account_id', 'amount', 'currency', 'notes', 'created_at', 'updated_at'],
    BUDGETS: ['id', 'category_id', 'month', 'amount', 'currency', 'notes', 'archived', 'created_at', 'updated_at'],
    SAVINGS_GOALS: ['id', 'name', 'target_amount', 'current_amount', 'currency', 'deadline', 'notes', 'archived', 'created_at', 'updated_at'],
    RECURRING: ['id', 'name', 'type', 'entity', 'account_id', 'category_id', 'amount', 'currency', 'frequency', 'next_run_date', 'notes', 'archived', 'created_at', 'updated_at'],
    PROPERTIES: ['id', 'name', 'address', 'notes', 'archived', 'created_at', 'updated_at'],
    ROOMS: ['id', 'property_id', 'name', 'status', 'default_nightly_rate', 'currency', 'notes', 'archived', 'created_at', 'updated_at'],
    BOOKINGS: ['id', 'room_id', 'guest', 'check_in', 'check_out', 'amount_received', 'currency', 'status', 'notes', 'created_at', 'updated_at'],
    AUDIT_LOG: ['id', 'action', 'entity_type', 'entity_id', 'details', 'created_at'],
    META: ['key', 'value']
  },
  ACCOUNT_TYPES: ['Cash', 'Bank', 'Savings', 'Investment', 'Other Asset', 'Liability'],
  CATEGORY_TYPES: ['Income', 'Expense', 'Savings'],
  TRANSACTION_TYPES: ['Income', 'Expense', 'Savings'],
  FREQUENCIES: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
  ROOM_STATUS: ['Available', 'Occupied', 'Maintenance', 'Blocked'],
  BOOKING_STATUS: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
  CURRENCIES: ['EUR', 'USD', 'LBP'],
  DEFAULT_EXCHANGE_RATES: {
    EUR: 1.0,
    USD: 1.10,
    LBP: null
  }
};
