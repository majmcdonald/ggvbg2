export const COLS = 8;
export const ROWS = 8;
export const CELL = 80;
export const HUD_H = 50;
export const TRAY_H = 110;
export const CARD_W = 82;
export const CARD_H = TRAY_H - 16;
export const CARD_PAD = 8;

// Castle wall thickness around the battlefield
export const WALL = 32;

export const CW = COLS * CELL + WALL * 2;                  // 704
export const CH = HUD_H + TRAY_H + ROWS * CELL + WALL * 2; // 864 (css/style.css uses this aspect ratio)

export const GRID_TOP = HUD_H + TRAY_H + WALL;
export const GRID_LEFT = WALL;

// Between waves, survivors heal this fraction of max HP, capped at max.
export const HEAL_BETWEEN_WAVES = 0.65;

// The speed-up button appears once the level has been fighting this long (all waves combined).
export const SPEED_UP_AFTER = 15;
export const FAST_SPEED = 2;

// Seconds a unit's attack swing lasts.
export const ATTACK_ANIM_TIME = 0.25;

// After beating a floor's last level: fireworks, then fade to black, then the next floor's title card.
export const FIREWORKS_TIME = 3.5;
export const DARKEN_TIME = 1.5;

export function cellX(col) { return GRID_LEFT + col * CELL + CELL / 2; }
export function cellY(row) { return GRID_TOP + row * CELL + CELL / 2; }
