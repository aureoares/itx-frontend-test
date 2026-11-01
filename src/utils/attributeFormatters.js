/**
 * Formats a single attribute value safely.
 * Handles arrays (e.g. camera lists), numbers, and null/undefined values.
 *
 * @param {any} value
 * @returns {string} Formatted string or '-' if empty/null
 */
export function formatAttributeValue(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (Array.isArray(value)) {
    const validItems = value.filter((item) => item !== null && item !== undefined && String(item).trim() !== '');
    return validItems.length > 0 ? validItems.join(', ') : '-';
  }

  const str = String(value).trim();
  return str.length > 0 ? str : '-';
}

/**
 * Extracts and formats the complete list of technical specifications from a product detail object.
 * Maps API property names (including known API typos like 'secondaryCmera' and 'dimentions')
 * to standard display labels.
 *
 * @param {object} [product]
 * @returns {Array<{ key: string, label: string, value: string }>}
 */
export function buildSpecificationItems(product = {}) {
  const p = product || {};

  const rawWeight = p.weight;
  let formattedWeight = '-';
  if (rawWeight !== null && rawWeight !== undefined && String(rawWeight).trim() !== '') {
    const weightStr = String(rawWeight).trim();
    formattedWeight = weightStr.toLowerCase().endsWith('g') ? weightStr : `${weightStr} g`;
  }

  return [
    { key: 'cpu', label: 'CPU', value: formatAttributeValue(p.cpu) },
    { key: 'ram', label: 'RAM', value: formatAttributeValue(p.ram) },
    { key: 'os', label: 'Operating System', value: formatAttributeValue(p.os) },
    { key: 'displayResolution', label: 'Screen resolution', value: formatAttributeValue(p.displayResolution) },
    { key: 'battery', label: 'Battery', value: formatAttributeValue(p.battery) },
    { key: 'primaryCamera', label: 'Primary Camera', value: formatAttributeValue(p.primaryCamera) },
    { key: 'secondaryCamera', label: 'Secondary Camera', value: formatAttributeValue(p.secondaryCmera ?? p.secondaryCamera) },
    { key: 'dimensions', label: 'Dimensions', value: formatAttributeValue(p.dimentions ?? p.dimensions) },
    { key: 'weight', label: 'Weight', value: formattedWeight },
  ];
}
