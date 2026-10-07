export function isRock(level, row, col) {
  return level.rocks.some(r => r.row === row && r.col === col);
}

export function isPool(level, row, col) {
  return level.pools.some(p =>
    row >= p.row && row < p.row + p.h &&
    col >= p.col && col < p.col + p.w);
}

// Zones are column ranges, optionally limited to rows (rowMin/rowMax), and may leave out
// another zone (`outside`), e.g. bad guys all around the good guys' square.
export function inZone(zone, row, col) {
  if (col < zone.colMin || col > zone.colMax) return false;
  if (zone.rowMin !== undefined && (row < zone.rowMin || row > zone.rowMax)) return false;
  return !(zone.outside && inZone(zone.outside, row, col));
}

// Surround levels: which way a good guy must face to attack a bad guy, or null if it's
// on the wrong side. Each direction covers a wedge, diagonals included.
export function facingNeeded(from, to) {
  const dr = to.row - from.row, dc = to.col - from.col;
  if (dc > 0 && Math.abs(dr) <= dc) return 'right';
  if (dc < 0 && Math.abs(dr) <= -dc) return 'left';
  if (dr > 0 && Math.abs(dc) <= dr) return 'down';
  if (dr < 0 && Math.abs(dc) <= -dr) return 'up';
  return null;
}

export function inFacing(from, to, facing) {
  const dr = to.row - from.row, dc = to.col - from.col;
  if (facing === 'right') return dc > 0 && Math.abs(dr) <= dc;
  if (facing === 'left') return dc < 0 && Math.abs(dr) <= -dc;
  if (facing === 'down') return dr > 0 && Math.abs(dc) <= dr;
  return dr < 0 && Math.abs(dc) <= -dr;
}
