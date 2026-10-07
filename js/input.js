import { GOOD_GUY_DEFS } from './data/goodGuys.js';
import { hasSave } from './save.js';
import { askName, isNameDialogOpen } from './nameDialog.js';
import {
  state, startLevel, goToMenu, flash, placeFromCard, goodGuyAt, canPlace, badGuyAt, canPlaceBad, makeBadGuy,
  isUnlocked, toggleLoadout, confirmLoadout, nextLevelIndex,
  wardrobeUnlocked, openWardrobe, chooseClothes, rollWardrobe,
  chooseSave, openSaves, tapDelete, createSave, renameSave, saveName,
} from './state.js';
import { saveSlotButtons } from './render/saves.js';
import { introCanContinue } from './render/intro.js';
import {
  wardrobeBackButton, wardrobeUnitButtons, wardrobeItemButtons, wardrobeTabs, rollButton,
  prevPageButton, nextPageButton, pageCount, pageOf,
} from './render/wardrobe.js';
import { startWave } from './waves.js';
import { hudButton, hudMenuButton, canChangeSpeed, sandboxSideButton, showSideButton } from './render/hud.js';
import { FAST_SPEED } from './config.js';
import { cardAt } from './render/tray.js';
import { cellAt } from './render/grid.js';
import { menuButtons, wardrobeButton, savesButton, prepareCards, prepareStartButton, prepareBackButton, resultButtons } from './render/screens.js';

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Pointer events cover mouse and touch with one handler.
export function initInput(canvas) {
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * canvas.width / r.width;
    const y = (e.clientY - r.top) * canvas.height / r.height;
    handleTap(x, y);
  });
}

function handleTap(x, y) {
  if (isNameDialogOpen()) return;
  if (state.phase === 'intro') {
    if (introCanContinue()) startLevel(0);
    return;
  }
  if (state.phase === 'saves') return tapSaves(x, y);
  if (state.phase === 'menu') return tapMenu(x, y);
  if (state.phase === 'prepare') return tapPrepare(x, y);
  if (state.phase === 'wardrobe') return tapWardrobe(x, y);
  if (state.phase === 'level_won' || state.phase === 'level_lost') return tapResult(x, y);
  if (inRect(x, y, hudMenuButton)) return goToMenu();
  if (showSideButton() && inRect(x, y, sandboxSideButton)) {
    state.trayMode = state.trayMode === 'good' ? 'bad' : 'good';
    state.selection = null;
    return;
  }
  if (inRect(x, y, hudButton)) return tapHudButton();

  const cardId = cardAt(x, y);
  if (cardId) return tapCard(cardId);

  const cell = cellAt(x, y);
  if (cell) tapCell(cell.row, cell.col);
}

function tapSaves(x, y) {
  for (const b of saveSlotButtons()) {
    const used = hasSave(b.slot);
    if (used && inRect(x, y, b.del)) return tapDelete(b.slot);
    if (used && inRect(x, y, b.rename)) {
      state.deleteArmed = null;
      return askName('Rename your save', saveName(b.slot), name => renameSave(b.slot, name));
    }
    if (!inRect(x, y, b.card)) continue;
    if (used) return chooseSave(b.slot);
    return askName('Name your new save', `Save ${b.slot}`, name => createSave(b.slot, name));
  }
  state.deleteArmed = null;
}

function tapMenu(x, y) {
  if (inRect(x, y, savesButton)) return openSaves();
  if (inRect(x, y, wardrobeButton)) {
    if (wardrobeUnlocked()) openWardrobe();
    return;
  }
  const b = menuButtons().find(b => inRect(x, y, b));
  if (b && isUnlocked(b.levelIndex)) startLevel(b.levelIndex);
}

function tapWardrobe(x, y) {
  if (inRect(x, y, wardrobeBackButton)) return goToMenu();
  if (inRect(x, y, rollButton)) {
    rollWardrobe();
    if (state.lastRoll) state.wardrobePage = pageOf(state.lastRoll);
    return;
  }
  const tab = wardrobeTabs().find(b => inRect(x, y, b));
  if (tab) {
    state.wardrobeTab = tab.slot;
    state.wardrobePage = 0;
    return;
  }
  if (pageCount() > 1 && inRect(x, y, prevPageButton)) {
    state.wardrobePage = Math.max(0, state.wardrobePage - 1);
    return;
  }
  if (pageCount() > 1 && inRect(x, y, nextPageButton)) {
    state.wardrobePage = Math.min(pageCount() - 1, state.wardrobePage + 1);
    return;
  }
  const unit = wardrobeUnitButtons().find(b => inRect(x, y, b));
  if (unit) {
    state.wardrobeUnit = unit.id;
    state.wardrobePage = 0;
    return;
  }
  const item = wardrobeItemButtons().find(b => inRect(x, y, b));
  if (item) chooseClothes(item.slot, item.itemId);
}

function tapPrepare(x, y) {
  if (inRect(x, y, prepareStartButton)) return confirmLoadout();
  if (inRect(x, y, prepareBackButton)) return goToMenu();
  const card = prepareCards().find(c => inRect(x, y, c));
  if (card) toggleLoadout(card.id);
}

function tapResult(x, y) {
  const b = resultButtons().find(b => inRect(x, y, b));
  if (!b) return;
  if (b.action === 'menu') goToMenu();
  else if (b.action === 'retry') startLevel(state.levelIndex);
  else if (b.action === 'next') startLevel(nextLevelIndex());
}

function tapHudButton() {
  if (state.phase === 'placement') startWave();
  else if (canChangeSpeed()) state.speed = state.speed === 1 ? FAST_SPEED : 1;
}

function tapCard(id) {
  if (state.phase !== 'placement') {
    flash('Reinforcements can only be added between waves');
    return;
  }
  if (state.trayMode === 'bad') {
    state.selection = state.selection?.badId === id ? null : { badId: id };
    return;
  }
  if (state.money < GOOD_GUY_DEFS[id].cost) {
    flash('Not enough money');
    return;
  }
  state.selection = state.selection?.cardId === id ? null : { cardId: id };
}

// Tapping a good guy picks it up; tapping a valid cell drops it there (re-place).
function placeError(id) {
  const def = GOOD_GUY_DEFS[id];
  if (def.platform) return 'Floaty goes on an empty pool cell in your castle';
  if (def.smashesRock) return 'Axe Man can only go on a rock in your castle';
  return "Can't place there";
}

function tapCell(row, col) {
  const unit = goodGuyAt(row, col);
  const sel = state.selection;

  // Sandbox: tap a placed bad guy to remove it; with a bad guy card selected, tap to add one.
  if (state.level.sandbox && state.phase === 'placement') {
    const bad = badGuyAt(row, col);
    if (bad) {
      state.badGuys = state.badGuys.filter(b => b !== bad);
      return;
    }
    if (sel?.badId) {
      if (canPlaceBad(row, col)) state.badGuys.push(makeBadGuy(sel.badId, row, col));
      else flash('Bad guys go on the red side');
      return;
    }
  }

  if (unit) {
    state.selection = sel?.unit === unit ? null : { unit };
    return;
  }
  if (!sel) return;
  const id = sel.cardId || sel.unit.id;
  if (!canPlace(row, col, id)) {
    flash(placeError(id));
    return;
  }

  if (sel.cardId) {
    placeFromCard(sel.cardId, row, col);
  } else {
    sel.unit.row = row;
    sel.unit.col = col;
  }
  state.selection = null;
}
