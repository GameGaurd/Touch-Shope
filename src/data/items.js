import { getItemImage } from './imageMap.js';

const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1vKUF2VMFlnAjJJ2wvEfF0Tiq7RkeMynUtBR2A1w0vpc/export?format=csv&gid=0';

function parsePrice(value) {
  if (!value) return 0;
  const clean = String(value).replace(/[₱,\s]/g, '').replace(/[^0-9.]/g, '');
  return Number.parseFloat(clean || '0');
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function makeImageDataUri(title, category) {
  const safeTitle = String(title ?? 'Item').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = String(category ?? 'Touch 4 Games').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const label = safeTitle.length > 22 ? `${safeTitle.slice(0, 22)}…` : safeTitle;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="620" viewBox="0 0 800 620">
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#111827"/>
          <stop offset="50%" stop-color="#1f2a44"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#7c9cff"/>
          <stop offset="100%" stop-color="#34d399"/>
        </linearGradient>
      </defs>
      <rect width="800" height="620" fill="url(#g1)"/>
      <circle cx="650" cy="110" r="120" fill="url(#g2)" opacity="0.22"/>
      <circle cx="180" cy="500" r="180" fill="#7c9cff" opacity="0.12"/>
      <rect x="80" y="70" width="640" height="480" rx="26" fill="rgba(15,23,42,0.62)" stroke="rgba(148,163,184,0.35)"/>
      <text x="400" y="250" text-anchor="middle" font-size="52" font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="#e2e8f0">${label}</text>
      <text x="400" y="310" text-anchor="middle" font-size="24" font-family="Segoe UI, Arial, sans-serif" fill="#a8b9ff" letter-spacing="4">${safeCategory.toUpperCase()}</text>
      <rect x="240" y="350" width="320" height="8" rx="4" fill="url(#g2)" opacity="0.8"/>
      <text x="400" y="440" text-anchor="middle" font-size="26" font-family="Segoe UI, Arial, sans-serif" fill="#cbd5e1">Touch 4 Games</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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

      const itemName = normalizeText(name);
      const itemType = normalizeText(type || 'Unknown');
      const mappedImage = getItemImage(itemName);
      const item = {
        id: `touch-${itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 8)}`,
        name: itemName,
        type: itemType,
        category: itemType,
        price: parsePrice(price),
        qty: Number.parseInt(quantity || '0', 10) || 0,
        inStock: parseInventory(quantity),
        stock: Number.parseInt(quantity || '0', 10) || 0,
        rawStatus: 'Available',
        description: `Touch 4 Games ${itemType || 'item'} item.`,
        image: mappedImage || makeImageDataUri(itemName, itemType),
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
