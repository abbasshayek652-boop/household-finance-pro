/**
 * Database.gs
 * Core sheet helpers for storing app data.
 */

function setupDatabase_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = [
    'Accounts', 'Categories', 'Transactions', 'Budgets', 'SavingsGoals',
    'Recurring', 'Properties', 'Rooms', 'Bookings', 'AuditLog', 'Meta'
  ];

  sheets.forEach((name) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
  });

  const headerMap = {
    Accounts: ['id', 'name', 'owner', 'currency', 'type', 'opening_balance', 'notes', 'archived', 'created_at', 'updated_at'],
    Categories: ['id', 'name', 'type', 'parent_id', 'notes', 'archived', 'created_at', 'updated_at'],
    Transactions: ['id', 'date', 'type', 'entity', 'category_id', 'account_id', 'amount', 'currency', 'notes', 'created_at', 'updated_at'],
    Budgets: ['id', 'category_id', 'month', 'amount', 'currency', 'notes', 'archived', 'created_at', 'updated_at'],
    SavingsGoals: ['id', 'name', 'target_amount', 'current_amount', 'currency', 'deadline', 'notes', 'archived', 'created_at', 'updated_at'],
    Recurring: ['id', 'name', 'type', 'entity', 'account_id', 'category_id', 'amount', 'currency', 'frequency', 'next_run_date', 'notes', 'archived', 'created_at', 'updated_at'],
    Properties: ['id', 'name', 'address', 'notes', 'archived', 'created_at', 'updated_at'],
    Rooms: ['id', 'property_id', 'name', 'status', 'default_nightly_rate', 'currency', 'notes', 'archived', 'created_at', 'updated_at'],
    Bookings: ['id', 'room_id', 'guest', 'check_in', 'check_out', 'amount_received', 'currency', 'status', 'notes', 'created_at', 'updated_at'],
    AuditLog: ['id', 'action', 'entity_type', 'entity_id', 'details', 'created_at'],
    Meta: ['key', 'value']
  };

  Object.keys(headerMap).forEach((sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    const values = sheet.getDataRange().getValues();
    if (values.length === 0 || String(values[0][0]) !== String(headerMap[sheetName][0])) {
      sheet.clear();
      sheet.appendRow(headerMap[sheetName]);
    }
  });

  const metaSheet = ss.getSheetByName('Meta');
  const metaRows = metaSheet.getDataRange().getValues();
  const metaKeys = metaRows.slice(1).map((r) => r[0]);

  if (!metaKeys.includes('base_currency')) metaSheet.appendRow(['base_currency', 'EUR']);
  if (!metaKeys.includes('setup_completed')) metaSheet.appendRow(['setup_completed', 'true']);

  logAudit_('SETUP', 'Database', 'database', { message: 'Database initialized' });
  return { success: true, message: 'Database setup complete' };
}

function getSheet_(sheetName) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
}

function getOrCreateSheet_(sheetName) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
    const headers = CONFIG.HEADERS[sheetName] || [];
    if (headers.length) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

function readSheet_(sheetName, headers) {
  const sheet = getSheet_(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, idx) => {
      item[header] = row[idx] !== undefined ? row[idx] : '';
    });
    return item;
  });
}

function addRecord_(sheetName, record, headers) {
  const sheet = getSheet_(sheetName);
  if (!sheet) return null;

  const out = Object.assign({}, record);
  if (!out.id) out.id = generateId_();
  if (!out.created_at) out.created_at = new Date().toISOString();
  if (!out.updated_at) out.updated_at = new Date().toISOString();

  sheet.appendRow(headers.map((header) => out[header] !== undefined ? out[header] : ''));
  return out;
}

function updateRecord_(sheetName, recordId, updates, headers) {
  const sheet = getSheet_(sheetName);
  if (!sheet) return null;

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return null;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(recordId)) {
      const current = {};
      headers.forEach((header, idx) => {
        current[header] = rows[i][idx] !== undefined ? rows[i][idx] : '';
      });
      const updated = Object.assign({}, current, updates, { updated_at: new Date().toISOString() });
      const newRow = headers.map((header) => updated[header] !== undefined ? updated[header] : '');
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
      return updated;
    }
  }

  return null;
}

function archiveRecord_(sheetName, recordId, headers) {
  return updateRecord_(sheetName, recordId, { archived: true }, headers);
}

function deleteRecord_(sheetName, recordId) {
  const sheet = getSheet_(sheetName);
  if (!sheet) return false;

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(recordId)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }

  return false;
}

function getMetadata_() {
  const sheet = getSheet_('Meta');
  if (!sheet) return {};

  const rows = sheet.getDataRange().getValues();
  const metadata = {};
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] !== undefined && rows[i][0] !== '') {
      metadata[String(rows[i][0])] = rows[i][1];
    }
  }
  return metadata;
}

function setMetaValue_(key, value) {
  const sheet = getSheet_('Meta');
  if (!sheet) return;

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(key)) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  sheet.appendRow([key, value]);
}

function getMetaValue_(key) {
  return getMetadata_()[key] || null;
}

function loadDatabaseSnapshot_() {
  return {
    accounts: readSheet_('Accounts', ['id', 'name', 'owner', 'currency', 'type', 'opening_balance', 'notes', 'archived', 'created_at', 'updated_at']),
    categories: readSheet_('Categories', ['id', 'name', 'type', 'parent_id', 'notes', 'archived', 'created_at', 'updated_at']),
    transactions: readSheet_('Transactions', ['id', 'date', 'type', 'entity', 'category_id', 'account_id', 'amount', 'currency', 'notes', 'created_at', 'updated_at']),
    budgets: readSheet_('Budgets', ['id', 'category_id', 'month', 'amount', 'currency', 'notes', 'archived', 'created_at', 'updated_at']),
    savingsGoals: readSheet_('SavingsGoals', ['id', 'name', 'target_amount', 'current_amount', 'currency', 'deadline', 'notes', 'archived', 'created_at', 'updated_at']),
    recurring: readSheet_('Recurring', ['id', 'name', 'type', 'entity', 'account_id', 'category_id', 'amount', 'currency', 'frequency', 'next_run_date', 'notes', 'archived', 'created_at', 'updated_at']),
    metadata: getMetadata_()
  };
}

function loadRentalSnapshot_() {
  return {
    properties: readSheet_('Properties', ['id', 'name', 'address', 'notes', 'archived', 'created_at', 'updated_at']),
    rooms: readSheet_('Rooms', ['id', 'property_id', 'name', 'status', 'default_nightly_rate', 'currency', 'notes', 'archived', 'created_at', 'updated_at']),
    bookings: readSheet_('Bookings', ['id', 'room_id', 'guest', 'check_in', 'check_out', 'amount_received', 'currency', 'status', 'notes', 'created_at', 'updated_at'])
  };
}
