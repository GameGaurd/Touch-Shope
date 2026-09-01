const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1vKUF2VMFlnAjJJ2wvEfF0Tiq7RkeMynUtBR2A1w0vpc/export?format=csv&gid=0';

function parsePrice(value) {
  if (!value) return 0;
  const clean = String(value).replace(/[₱,\s]/g, '').replace(/[^0-9.]/g, '');
  return Number.parseFloat(clean || '0');
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function parseInventory(raw) {
  if (raw === undefined || raw === null || raw === '') return true;
  const value = String(raw).toLowerCase().trim();
  if (['available', 'in stock', 'instock', 'stocked', 'yes'].includes(value)) return true;
  if (['sold', 'out of stock', 'outofstock', 'reserved', 'unavailable', 'no'].includes(value)) return false;
  return Number.parseInt(String(raw).replace(/[^0-9]/g, ''), 10) > 0;
}

export async function fetchCatalogData() {
  const response = await fetch(spreadsheetUrl);
  if (!response.ok) {
    throw new Error('Unable to load Touch 4 Games catalog data.');
  }

  const csvText = await response.text();
  const rows = csvText.split(/\r?\n/).filter(Boolean);
  const parsed = [];

  const actualRows = rows.slice(7);

  for (const row of actualRows) {
    const cells = row.split(',');
    const safeCells = [];
    let current = '';
    let inQuotes = false;

    for (const char of row) {
      if (char === '"') {
        if (inQuotes && row[row.indexOf(char) + 1] === '"') {
          current += '"';
          // skip escaped quote by moving forward
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        safeCells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    safeCells.push(current);

    const values = safeCells.map((value) => value.replace(/^"|"$/g, '').trim());
    if (values.every((value) => !value)) continue;

    const itemGroups = [
      [values[0], values[1], values[2], values[3], values[4]],
      [values[5], values[6], values[7], values[8], values[9]],
      [values[10], values[11], values[12], values[13], values[14]],
      [values[15], values[16], values[17], values[18], values[19]],
    ];

    for (const group of itemGroups) {
      const [quantity, name, blank, type, price] = group;
      if (!name || !price) continue;

      const item = {
        id: `touch-${normalizeText(name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 8)}`,
        name: normalizeText(name),
        type: normalizeText(type || 'Unknown'),
        category: normalizeText(type || 'Unknown'),
        price: parsePrice(price),
        qty: Number.parseInt(quantity || '0', 10) || 0,
        inStock: parseInventory(quantity),
        stock: Number.parseInt(quantity || '0', 10) || 0,
        rawStatus: 'Available',
        description: `Touch 4 Games ${normalizeText(type || 'item')} item.`,
        image: '',
        rarity: '',
        available: parseInventory(quantity),
      };

      parsed.push(item);
    }
  }

  return parsed;
}

export function buildCategorySummary(items) {
  const categoryCounts = {};

  for (const item of items) {
    const key = item.category || 'Uncategorized';
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  }

  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
