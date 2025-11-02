/**
 * Safe number formatting utilities to prevent TypeError crashes
 */

/**
 * Safely format a number with fixed decimal places
 * @param {unknown} v - Value to format
 * @param {number} digits - Number of decimal places (default: 3)
 * @returns {string} Formatted number or '-' if invalid
 */
export function toFixedSafe(v, digits = 3) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  if (!isFinite(n)) return '-';
  // Handle very small numbers (avoid -0.000)
  const nn = Math.abs(n) < 1e-12 ? 0 : n;
  return nn.toFixed(digits);
}

/**
 * Safely format a percentage value
 * @param {unknown} v - Value to format
 * @param {number} digits - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage or '-' if invalid
 */
export function pctSafe(v, digits = 2) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  if (!isFinite(n)) return '-';
  return `${n.toFixed(digits)}%`;
}

/**
 * Parse a numeric value from string or number, replacing commas with dots
 * @param {unknown} v - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number or default
 */
export function parseNumeric(v, defaultValue = 0) {
  if (typeof v === 'number' && isFinite(v)) return v;
  
  const str = String(v ?? '').replace(',', '.');
  const n = parseFloat(str);
  
  return isFinite(n) ? n : defaultValue;
}

/**
 * Ensure a value is a valid finite number
 * @param {unknown} v - Value to check
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Valid number or default
 */
export function ensureNumber(v, defaultValue = 0) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return isFinite(n) ? n : defaultValue;
}
