// ═══════════════════════════════════════════════════════════════════
// PAC-STORE — Pathfinding & TSP Route Planning
// ═══════════════════════════════════════════════════════════════════

import { TILE, FLOORS, WARP_PAIRS, isWalkable, getLayout } from './store-map.js';

// ─── BFS: Shortest Path between two points on the SAME floor ────────
/**
 * Breadth-First Search to find shortest path from (sr,sc) to (er,ec)
 * on a single floor. Walls (TILE.WALL) are avoided.
 * Returns array of {row, col} from start to end (inclusive), or null.
 */
export function bfs(floorId, startRow, startCol, endRow, endCol) {
  const layout = getLayout(floorId);
  const rows = layout.length;
  const cols = layout[0].length;

  if (startRow === endRow && startCol === endCol) {
    return [{ row: startRow, col: startCol }];
  }

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));

  const queue = [{ row: startRow, col: startCol }];
  visited[startRow][startCol] = true;

  const directions = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 },  // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 },  // right
  ];

  while (queue.length > 0) {
    const { row, col } = queue.shift();

    if (row === endRow && col === endCol) {
      // Reconstruct path
      const path = [];
      let curr = { row, col };
      while (curr) {
        path.unshift(curr);
        curr = parent[curr.row][curr.col];
      }
      return path;
    }

    for (const { dr, dc } of directions) {
      const nr = row + dr;
      const nc = col + dc;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[nr][nc]) continue;
      if (layout[nr][nc] === TILE.WALL) continue;

      visited[nr][nc] = true;
      parent[nr][nc] = { row, col };
      queue.push({ row: nr, col: nc });
    }
  }

  return null; // No path found
}

// ─── MULTI-FLOOR PATH (with warps) ──────────────────────────────────
/**
 * Find a path between two points that may be on different floors.
 * Returns an array of { floor, row, col, action? } objects.
 * 'action' can be 'warp' to indicate a floor transition.
 */
export function findMultiFloorPath(fromFloor, fromRow, fromCol, toFloor, toRow, toCol) {
  if (fromFloor === toFloor) {
    const path = bfs(fromFloor, fromRow, fromCol, toRow, toCol);
    if (!path) return null;
    return path.map(p => ({ floor: fromFloor, row: p.row, col: p.col }));
  }

  // Find the best warp to use
  const warpEntry = findBestWarp(fromFloor, fromRow, fromCol, toFloor, toRow, toCol);
  if (!warpEntry) return null;

  const { warpOnFrom, warpOnTo } = warpEntry;

  // Path: start -> warp entry on fromFloor
  const pathToWarp = bfs(fromFloor, fromRow, fromCol, warpOnFrom.row, warpOnFrom.col);
  if (!pathToWarp) return null;

  // Path: warp exit on toFloor -> destination
  const pathFromWarp = bfs(toFloor, warpOnTo.row, warpOnTo.col, toRow, toCol);
  if (!pathFromWarp) return null;

  const result = [
    ...pathToWarp.map(p => ({ floor: fromFloor, row: p.row, col: p.col })),
    { floor: toFloor, row: warpOnTo.row, col: warpOnTo.col, action: 'warp' },
    ...pathFromWarp.slice(1).map(p => ({ floor: toFloor, row: p.row, col: p.col })),
  ];

  return result;
}

/**
 * Find the best warp pair to go from one floor to another.
 */
function findBestWarp(fromFloor, fromRow, fromCol, toFloor, toRow, toCol) {
  let bestWarp = null;
  let bestDist = Infinity;

  for (const pair of WARP_PAIRS) {
    // Check both directions
    const combos = [
      { from: pair.from, to: pair.to },
      { from: pair.to, to: pair.from },
    ];

    for (const combo of combos) {
      if (combo.from.floor !== fromFloor || combo.to.floor !== toFloor) continue;

      const distToWarp = manhattan(fromRow, fromCol, combo.from.row, combo.from.col);
      const distFromWarp = manhattan(combo.to.row, combo.to.col, toRow, toCol);
      const total = distToWarp + distFromWarp;

      if (total < bestDist) {
        bestDist = total;
        bestWarp = { warpOnFrom: combo.from, warpOnTo: combo.to };
      }
    }
  }

  return bestWarp;
}

function manhattan(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

// ─── TSP: Order multiple stops for shortest route ───────────────────
/**
 * Given a list of product locations and start/end positions,
 * find the near-optimal order to visit them using a greedy TSP heuristic.
 *
 * Each stop: { floor, row, col, name }
 * Returns: ordered array of stops (start -> products -> checkout)
 *   and the full multi-floor path segments.
 */
export function planRoute(startPos, productLocations, checkoutPos) {
  if (productLocations.length === 0) {
    // Just go from start to checkout
    const path = findMultiFloorPath(
      startPos.floor, startPos.row, startPos.col,
      checkoutPos.floor, checkoutPos.row, checkoutPos.col
    );
    return {
      orderedStops: [],
      fullPath: path || [],
    };
  }

  // Group products by floor for efficiency
  const byFloor = {};
  for (const p of productLocations) {
    if (!byFloor[p.floor]) byFloor[p.floor] = [];
    byFloor[p.floor].push(p);
  }

  // Greedy TSP: nearest-neighbor starting from startPos
  const remaining = [...productLocations];
  const orderedStops = [];
  let current = { floor: startPos.floor, row: startPos.row, col: startPos.col };

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      let dist;
      if (remaining[i].floor === current.floor) {
        dist = manhattan(current.row, current.col, remaining[i].row, remaining[i].col);
      } else {
        // Cross-floor: add penalty
        dist = manhattan(current.row, current.col, remaining[i].row, remaining[i].col) + 50;
      }
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    const next = remaining.splice(bestIdx, 1)[0];
    orderedStops.push(next);
    current = next;
  }

  // Build the full multi-segment path
  const fullPath = buildMultiStopPath(startPos, orderedStops, checkoutPos);

  return {
    orderedStops,
    fullPath,
  };
}

/**
 * Build the complete path through all stops.
 */
function buildMultiStopPath(startPos, orderedStops, checkoutPos) {
  const fullPath = [];
  let current = startPos;

  for (const stop of orderedStops) {
    const segment = findMultiFloorPath(
      current.floor, current.row, current.col,
      stop.floor, stop.row, stop.col
    );
    if (segment) {
      // Don't duplicate the first point if it matches the last of previous
      if (fullPath.length > 0) {
        fullPath.push(...segment.slice(1));
      } else {
        fullPath.push(...segment);
      }
    }
    current = stop;
  }

  // Final segment to checkout
  const checkoutSegment = findMultiFloorPath(
    current.floor, current.row, current.col,
    checkoutPos.floor, checkoutPos.row, checkoutPos.col
  );
  if (checkoutSegment) {
    if (fullPath.length > 0) {
      fullPath.push(...checkoutSegment.slice(1));
    } else {
      fullPath.push(...checkoutSegment);
    }
  }

  return fullPath;
}

/**
 * Find path from a position to the nearest warp on a floor.
 */
export function findNearestWarp(floorId, row, col) {
  let best = null;
  let bestDist = Infinity;

  for (const pair of WARP_PAIRS) {
    for (const warp of [pair.from, pair.to]) {
      if (warp.floor !== floorId) continue;
      const dist = manhattan(row, col, warp.row, warp.col);
      if (dist < bestDist) {
        bestDist = dist;
        best = warp;
      }
    }
  }

  return best;
}
