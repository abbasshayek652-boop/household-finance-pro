/**
 * Utils.gs
 * Shared helper functions.
 */

function generateId_() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function normalizeDate_(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const d = value;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
  }
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return normalizeDate_(d);
  }
  return null;
}

function toClientSafe_(value) {
  if (value instanceof Date) return normalizeDate_(value);
  if (Array.isArray(value)) return value.map(toClientSafe_);
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach((key) => {
      out[key] = toClientSafe_(value[key]);
    });
    return out;
  }
  return value;
}

function safeJsonStringify_(value) {
  try {
    return JSON.stringify(value || {});
  } catch (e) {
    return '{}';
  }
}

function safeJsonParse_(json, fallback) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return fallback;
  }
}

function getCurrentTimestamp_() {
  return new Date().toISOString();
}

function isValidDate_(value) {
  if (!value || typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value + 'T00:00:00Z').getTime());
}
