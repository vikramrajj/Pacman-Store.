// ═══════════════════════════════════════════════════════════════════
// PAC-STORE — Store Map & Product Catalog
// ═══════════════════════════════════════════════════════════════════

// ─── TILE TYPES ─────────────────────────────────────────────────────
export const TILE = {
  EMPTY: 0,
  WALL: 1,
  DOT: 2,
  PRODUCT: 3,
  CHECKOUT: 4,
  WARP: 5,
  POWER_PELLET: 6,
  ENEMY_PATH: 7,
};

// ─── FLOORS ─────────────────────────────────────────────────────────
const GROUND_FLOOR = {
  name: 'Ground Floor',
  id: '1F',
  // 0=empty, 1=wall, 2=dot, 3=product shelf, 4=checkout, 5=warp, 6=power pellet
  layout: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,1,3,2,2,2,2,1,3,2,2,2,2,1,3,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,1,1],
    [1,0,0,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,0,0,1],
    [1,0,0,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,0,0,1],
    [1,0,0,0,1,2,2,2,2,5,2,2,2,2,2,5,2,2,2,2,1,0,0,0,1],
    [1,0,0,0,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,0,0,0,1],
    [1,0,0,0,1,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,1,0,0,0,1],
    [1,0,0,0,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,0,0,0,1],
    [1,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,1],
    [1,0,0,0,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
};

const BASEMENT = {
  name: 'Basement',
  id: 'B1',
  layout: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,1,3,2,2,2,2,1,3,2,2,2,2,1,3,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1],
    [1,2,2,2,2,2,2,2,2,5,2,2,2,2,2,5,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,1,3,2,2,2,2,1,3,2,2,2,2,1,3,2,2,2,2,1,0,0,1],
    [1,0,0,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,0,0,1],
    [1,0,0,1,2,1,0,1,2,1,2,1,0,1,2,1,2,1,0,1,2,1,0,0,1],
    [1,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
};

export const FLOORS = {
  '1F': GROUND_FLOOR,
  'B1': BASEMENT,
};

// ─── PRODUCT CATALOG ────────────────────────────────────────────────
// Products mapped to { floor, row, col, zone }
export const PRODUCT_CATALOG = {
  // Ground Floor Products
  'Milk':     { floor: '1F', row: 1, col: 1, zone: 'Dairy' },
  'Cheese':   { floor: '1F', row: 1, col: 7, zone: 'Dairy' },
  'Yogurt':   { floor: '1F', row: 1, col: 13, zone: 'Dairy' },
  'Butter':   { floor: '1F', row: 1, col: 19, zone: 'Dairy' },
  'Bread':    { floor: '1F', row: 3, col: 23, zone: 'Bakery' },
  'Eggs':     { floor: '1F', row: 3, col: 1, zone: 'Dairy' },
  'Apple':    { floor: '1F', row: 6, col: 7, zone: 'Produce' },
  'Banana':   { floor: '1F', row: 6, col: 13, zone: 'Produce' },
  'Orange':   { floor: '1F', row: 6, col: 19, zone: 'Produce' },
  'Lettuce':  { floor: '1F', row: 8, col: 23, zone: 'Produce' },
  'Chicken':  { floor: '1F', row: 8, col: 1, zone: 'Meat' },
  'Beef':     { floor: '1F', row: 9, col: 7, zone: 'Meat' },
  'Pork':     { floor: '1F', row: 9, col: 13, zone: 'Meat' },
  'Fish':     { floor: '1F', row: 9, col: 19, zone: 'Seafood' },
  'Shrimp':   { floor: '1F', row: 6, col: 1, zone: 'Seafood' },
  'Cereal':   { floor: '1F', row: 2, col: 9, zone: 'Breakfast' },
  'Rice':     { floor: '1F', row: 4, col: 15, zone: 'Grains' },
  'Pasta':    { floor: '1F', row: 7, col: 21, zone: 'Grains' },
  'Tomato':   { floor: '1F', row: 5, col: 3, zone: 'Produce' },
  'Onion':    { floor: '1F', row: 5, col: 9, zone: 'Produce' },
  'Potato':   { floor: '1F', row: 5, col: 15, zone: 'Produce' },

  // Basement Products
  'Wine':     { floor: 'B1', row: 1, col: 1, zone: 'Alcohol' },
  'Beer':     { floor: 'B1', row: 1, col: 7, zone: 'Alcohol' },
  'Whiskey':  { floor: 'B1', row: 1, col: 13, zone: 'Alcohol' },
  'Soda':     { floor: 'B1', row: 1, col: 19, zone: 'Beverages' },
  'Water':    { floor: 'B1', row: 4, col: 23, zone: 'Beverages' },
  'Juice':    { floor: 'B1', row: 4, col: 1, zone: 'Beverages' },
  'Chips':    { floor: 'B1', row: 7, col: 7, zone: 'Snacks' },
  'Cookies':  { floor: 'B1', row: 7, col: 13, zone: 'Snacks' },
  'Candy':    { floor: 'B1', row: 7, col: 19, zone: 'Snacks' },
  'IceCream': { floor: 'B1', row: 9, col: 23, zone: 'Frozen' },
  'Pizza':    { floor: 'B1', row: 9, col: 1, zone: 'Frozen' },
  'Soap':     { floor: 'B1', row: 13, col: 4, zone: 'Personal Care' },
  'Shampoo':  { floor: 'B1', row: 13, col: 10, zone: 'Personal Care' },
  'Toothpaste': { floor: 'B1', row: 13, col: 16, zone: 'Personal Care' },
  'Detergent':  { floor: 'B1', row: 13, col: 22, zone: 'Household' },
};

// ─── CHECKOUT POSITION ──────────────────────────────────────────────
export const CHECKOUT = { floor: '1F', row: 18, col: 11 };

// ─── PAC-MAN START POSITION ─────────────────────────────────────────
export const START_POS = { floor: '1F', row: 17, col: 5 };

// ─── WARP PAIRS (matching warp tiles across floors) ─────────────────
// Link: Each entry maps a warp tile on one floor to a warp tile on another
export const WARP_PAIRS = [
  { from: { floor: '1F', row: 13, col: 9 }, to: { floor: 'B1', row: 11, col: 9 } },
  { from: { floor: '1F', row: 13, col: 15 }, to: { floor: 'B1', row: 11, col: 15 } },
];

// ─── ENEMY PATHS (ghost patrol routes) ──────────────────────────────
export const ENEMY_PATHS = {
  '1F': [
    [{ row: 9, col: 1 }, { row: 9, col: 23 }, { row: 6, col: 23 }, { row: 6, col: 1 }],
    [{ row: 3, col: 1 }, { row: 3, col: 23 }, { row: 1, col: 23 }, { row: 1, col: 1 }],
  ],
  'B1': [
    [{ row: 4, col: 1 }, { row: 4, col: 23 }, { row: 7, col: 23 }, { row: 7, col: 1 }],
    [{ row: 9, col: 1 }, { row: 9, col: 23 }, { row: 1, col: 23 }, { row: 1, col: 1 }],
  ],
};

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────

/**
 * Find a product's location in the catalog.
 * If not found, assigns a random valid aisle location as "Mystery Aisle ❓".
 */
export function findProduct(productName) {
  const key = productName.trim();
  // Exact match
  if (PRODUCT_CATALOG[key]) {
    return { ...PRODUCT_CATALOG[key], name: key, isMystery: false };
  }
  // Case-insensitive match
  const lowerKey = key.toLowerCase();
  for (const [name, loc] of Object.entries(PRODUCT_CATALOG)) {
    if (name.toLowerCase() === lowerKey) {
      return { ...loc, name, isMystery: false };
    }
  }
  // Fuzzy/partial match
  for (const [name, loc] of Object.entries(PRODUCT_CATALOG)) {
    if (name.toLowerCase().includes(lowerKey) || lowerKey.includes(name.toLowerCase())) {
      return { ...loc, name, isMystery: false };
    }
  }
  // Mystery item: assign random location
  return getMysteryLocation(key);
}

/**
 * Get a random valid product location for unknown items.
 */
function getMysteryLocation(name) {
  const floors = Object.keys(FLOORS);
  const floor = floors[Math.floor(Math.random() * floors.length)];
  const layout = FLOORS[floor].layout;
  // Collect all product shelf positions
  const productPositions = [];
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === TILE.PRODUCT) {
        productPositions.push({ row: r, col: c });
      }
    }
  }
  const pos = productPositions[Math.floor(Math.random() * productPositions.length)] || { row: 1, col: 1 };
  return {
    ...pos,
    floor,
    zone: 'Mystery Aisle ❓',
    name,
    isMystery: true,
  };
}

/**
 * Get all product suggestions for autocomplete.
 */
export function getProductSuggestions(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const allProducts = Object.keys(PRODUCT_CATALOG);
  return allProducts
    .filter(name => name.toLowerCase().includes(q))
    .slice(0, 8);
}

/**
 * Get the layout for a given floor.
 */
export function getLayout(floorId) {
  return FLOORS[floorId]?.layout || FLOORS['1F'].layout;
}

/**
 * Check if a position is walkable (not a wall).
 */
export function isWalkable(floorId, row, col) {
  const layout = getLayout(floorId);
  if (row < 0 || row >= layout.length || col < 0 || col >= layout[0].length) return false;
  return layout[row][col] !== TILE.WALL;
}
