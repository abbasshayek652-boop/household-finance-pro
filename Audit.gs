/**
 * Audit.gs
 * Audit logging helpers for significant CRUD actions.
 */

function logAudit_(action, entityType, entityId, details) {
  const sheet = getOrCreateSheet_('AuditLog');
  const row = [
    generateId_(),
    action,
    entityType,
    entityId,
    safeJsonStringify_(details || {}),
    new Date().toISOString()
  ];
  sheet.appendRow(row);
}

function getAuditLog_(limit) {
  const sheet = getSheet_('AuditLog');
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const records = rows.slice(1).map((row) => ({
    id: row[0],
    action: row[1],
    entity_type: row[2],
    entity_id: row[3],
    details: safeJsonParse_(row[4], {}),
    created_at: row[5]
  }));
  return records.slice().reverse().slice(0, limit || 100);
}

function getAuditForEntity_(entityType, entityId) {
  const all = getAuditLog_(1000);
  return all.filter((item) => item.entity_type === entityType && item.entity_id === entityId);
}
