import { cellX, cellY } from './config.js';
import { GOOD_GUY_DEFS } from './data/goodGuys.js';
import { state, addEffect } from './state.js';

export function earn(amount, unit) {
  state.money += amount;
  addEffect('money', cellX(unit.col), cellY(unit.row), { color: '#f1c40f', text: `+$${amount}` });
}

// Runs during battle only; the timer carries over between waves.
export function updateIncome(dt) {
  for (const g of state.goodGuys) {
    const def = GOOD_GUY_DEFS[g.id];
    if (!def.income) continue;
    g.incomeTimer += dt;
    if (g.incomeTimer < def.incomeInterval) continue;
    g.incomeTimer -= def.incomeInterval;
    earn(Math.round(def.income * g.dmgMult), g);
  }
}
