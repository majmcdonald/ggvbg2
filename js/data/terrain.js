export function isRock(level, row, col) {
  return level.rocks.some(r => r.row === row && r.col === col);
}

export function isPool(level, row, col) {
  return level.pools.some(p =>
    row >= p.row && row < p.row + p.h &&
    col >= p.col && col < p.col + p.w);
}

export function inZone(zone, col) {
  return col >= zone.colMin && col <= zone.colMax;
}
