export const SLOTS = 5;

// Each save slot (1-3) has its own key. Before slots existed there was one save; it becomes slot 1.
const OLD_KEY = 'ggvbg2.progress';
const key = slot => `ggvbg2.save${slot}`;

// unlocked: highest level index the player may start. loadout: last chosen unit ids.
// name: chosen by the player for this save slot.
// cleared: level indexes beaten at least once.
// coins, owned ({ unitId: [itemIds] }, per good guy) and outfits: Wardrobe.
function defaults() {
  return { name: '', unlocked: 0, loadout: [], cleared: [], coins: 0, owned: {}, outfits: {} };
}

function readSlot(slot) {
  const saved = localStorage.getItem(key(slot));
  if (saved !== null || slot !== 1) return saved;
  return localStorage.getItem(OLD_KEY);
}

export function hasSave(slot) {
  try {
    return readSlot(slot) !== null;
  } catch {
    return false;
  }
}

export function deleteSave(slot) {
  try {
    localStorage.removeItem(key(slot));
    if (slot === 1) localStorage.removeItem(OLD_KEY);
  } catch {
    // Nothing stored; nothing to delete.
  }
}

// localStorage can be missing or throw (private mode, node tests); progress then lasts the session.
export function loadProgress(slot) {
  try {
    const progress = { ...defaults(), ...JSON.parse(readSlot(slot)) };
    // Saves from before `cleared` existed: every level below `unlocked` was beaten.
    if (!progress.cleared.length) {
      for (let i = 0; i < progress.unlocked; i++) progress.cleared.push(i);
    }
    // Clothes used to be shared by everyone; each good guy keeps what they were wearing.
    if (Array.isArray(progress.owned)) {
      progress.owned = {};
      for (const [unitId, outfit] of Object.entries(progress.outfits)) {
        progress.owned[unitId] = [outfit.shirt, outfit.hat].filter(Boolean);
      }
    }
    return progress;
  } catch {
    return defaults();
  }
}

export function saveProgress(slot, progress) {
  try {
    localStorage.setItem(key(slot), JSON.stringify(progress));
  } catch {
    // Not persisted; nothing else to do.
  }
}
