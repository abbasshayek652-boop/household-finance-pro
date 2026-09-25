/**
 * Configuration and Constants
 * Central location for all application constants and configuration
 */

const CONFIG = {
  SPREADSHEET_NAME: 'Household Finance Pro',
  TIMEZONE: 'Asia/Beirut',
  
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
  
  CACHE: {
    SNAPSHOT_TTL: 300, // 5 minutes
    EXCHANGE_RATES_TTL: 3600, // 1 hour
    METADATA_TTL: 3600
  },
  
  AUDIT_ACTIONS: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    ARCHIVE: 'ARCHIVE',
    DELETE: 'DELETE',
    SETUP: 'SETUP',
    REPAIR: 'REPAIR'
  },
  
  DEFAULT_EXCHANGE_RATES: {
    'EUR': 1.0,
    'USD': 1.10,
    'LBP': null // User must configure
  },
  
  CACHE_KEYS: {
    FINANCIAL_SNAPSHOT: 'financial_snapshot',
    RENTAL_SNAPSHOT: 'rental_snapshot',
    EXCHANGE_RATES: 'exchange_rates',
    METADATA: 'metadata'
  }
};

/**
 * Get the active Google Sheet
 */
function getSheet_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(sheetName);
}

/**
 * Get or create a sheet
 */
function getOrCreateSheet_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}
