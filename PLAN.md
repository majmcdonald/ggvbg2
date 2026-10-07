# Good Guys vs Bad Guys 2 — Project Plan

Reference: `../ggvbg/index.html` (single-file canvas lane defense, 8x8 grid, 14 good guys, 11 bad guys, 14 levels).

## 1. Concept

Same good guys (names retained, new looks, new stats). New bad guys. Nobody moves. The player places good guys on a grid, the bad guys appear in fixed formations, and both sides fight in place until one side is defeated.

## 2. Decisions (confirmed)

| Area | Decision |
|---|---|
| Movement | Both sides stationary |
| Win | Defeat all bad guys in all waves |
| Lose | All good guys defeated (see open question on money) |
| Grid | 8x8, same as ggvbg |
| Zones | Player/enemy column ranges vary per level |
| Terrain | Rocks and pools carry over; more terrain possible later |
| Targeting | Any-to-any, range measured in cells; not lane-restricted |
| Deployment | Starting budget, then reinforcements between waves |
| Repositioning | Player may pull back / re-place units (including mid-wave) |
| Waves | Whole wave appears at once at wave start, authored formation |
| Wave start | Player presses Start Wave |
| Economy | Money Man income + money for defeating bad guys |
| Persistence between waves | Survivors persist; heal +65 percentage points of max HP, capped at 100% (25% -> 90%) |
| Roster | Good guys: same names, new looks and stats. Bad guys: 2 at launch, more in later versions |
| Launch bad guys | Normal Bad Guy (melee), Spear Bad Guy (ranged) |
| Modes | Level list with unlocks (loadout/prepare screen as ggvbg) + Endless mode |
| Art | Characters drawn in JavaScript (`js/render/people.js`); no image files |
| Platform | Desktop mouse + touch; progress in localStorage |
| Tech | Multiple files, no build step (plain browser JS) |
| Terminology | Use "defeat", never "kill", in code, UI text, and docs |

## 3. Architecture

Plain ES modules, served statically. No bundler.

```
ggvbg2/
  index.html          canvas + script type=module
  css/style.css
  js/
    main.js           bootstrap, game loop
    config.js         grid/canvas constants
    data/
      goodGuys.js     GOOD_GUY_DEFS
      badGuys.js      BAD_GUY_DEFS
      levels.js       LEVELS
      terrain.js      rock/pool helpers
    state.js          game state, phase machine
    combat.js         targeting, damage, projectiles
    waves.js          wave spawn, clear detection, between-wave heal
    economy.js        money, income, rewards
    input.js          mouse + touch, placement, pull-back
    save.js           localStorage progress
    render/
      grid.js hud.js tray.js sprites.js screens.js
  assets/sprites/     good/, bad/, ui/
  tools/              sprite generation notes/scripts
```

Phase machine: `menu -> prepare -> placement -> battle -> wave_clear -> placement -> ... -> level_won | level_lost`.

ES modules require a static server; `file://` will not load them. Use `python3 serve.py` (port 8000), which disables browser caching so edits show on refresh.

## 4. Milestones

1. **Skeleton** (done) — `index.html`, module loading, canvas, grid drawing, phase machine, placeholder rectangles.
2. **Placement** (done) — tray, money, place/pull-back with mouse and touch, zone enforcement per level, rocks/pools.
3. **Combat core** (done) — any-to-any targeting, melee and ranged attacks, projectiles, HP, defeat handling, 2 bad guys, 3 starter good guys (Money Man, Boomerang Man, Swordsman).
4. **Waves and economy** (done) — Start Wave button, authored formations, defeat rewards, Money Man income, between-wave heal, level win/lose.
5. **Full good-guy roster** (done; Sandbox level for testing) — port all 14 names with new stats and abilities (Section 6).
6. **Levels and progression** (done: 13 levels, loadout of 7, saved progress) — level list, unlock screen, prepare/loadout screen, localStorage save.
7. **Endless mode** — escalating generated formations, score/best-wave persistence.
8. **Sprites** — generate, clean, integrate; replace placeholders. Can run in parallel from milestone 3.
9. **Polish** — sound (optional), tuning pass, touch QA on phone, empty/error states.

## 5. Sprite pipeline

- Set per character: idle, attack, hurt, defeated. Transparent PNG, one fixed cell size (proposed 256x256), consistent facing (good guys right-facing, bad guys left-facing, or mirrored in code).
- Roster to generate: 14 good guys + 2 bad guys + terrain (rock, pool) + UI icons.
- Steps: define a style guide prompt, generate one character, approve style, batch the rest, remove backgrounds, normalize size and anchor point, name as `assets/sprites/{good|bad}/<id>_<state>.png`.
- Superseded: characters are drawn in JavaScript (`js/render/people.js`), each with its own outfit, idle bob and attack swing. No image files are loaded.

## 6. Good-guy roster port

Names retained: Money Man, Boomerang Man, Dual Boomerang, Crawler Hunter, Thrower, Spearman, Swordsman, Axe Man, Ice Boomerang, Wall, Wall of Doom, Bomb, Mini Bomb, Floaty.

Implemented roles (draft stats in `js/data/goodGuys.js`; pending confirmation):

| Unit | Role |
|---|---|
| Money Man | $25 per 5s during battle; no attack |
| Boomerang Man | Homing boomerang to nearest; may clip one other bad guy on return |
| Dual Boomerang | Two boomerangs at the two nearest bad guys |
| Crawler Hunter | Longer-range boomerang targeting the weakest bad guy in range |
| Thrower | Ball rolls along its own row, hitting every bad guy it passes |
| Spearman | Range 6, slow, high damage |
| Swordsman | Melee range 2, fast |
| Axe Man | As in ggvbg: can only be placed on a rock in the player zone; smashes it and leaves (not a fighter) |
| Ice Boomerang | Hits halve target attack speed for 3s |
| Wall, Wall of Doom | No attack; bad guys in range target them first, but only while a good guy stands behind the wall (same row, closer to the player's side); an unguarding wall is ignored |
| Bomb, Mini Bomb | Untargetable; explode when a bad guy is within range (2 / 1 cells), area damage |
| Floaty | As in ggvbg: a float placed on a pool cell in the player zone; a good guy can then be placed on that water cell. Not a unit: no HP, can't be attacked, stays for the level |

## 7. Bad guys at launch

| Unit | Role | Draft stats (tune later) |
|---|---|---|
| Normal Bad Guy | Short-range rock thrower, range 4 (melee range 2 never reached the back of the player zone) | hp 100, 8 dmg/s, reward 10 |
| Spear Bad Guy | Ranged, range 5 | hp 90, 12.8 dmg/s, reward 20 |
| Triple Boomerang Bad Guy | Throws 3 orange boomerangs at once at 3 different good guys within range 4; they return and can clip one more. Introduced in Level 4 | hp 120, 3 x 10 dmg every 1.7s, reward 35 |
| Karate Bad Guy | Every 5s a flurry of 5 quick long-range energy punches (6 each) on the nearest good guy within 6 cells; a stun breaks the flurry. Introduced in Level 5 | hp 130, reward 30 |
| Giant Skeleton (boss) | Level 10 boss level: on the field for the whole level; waves end at breaks when his HP reaches 2/3 and 1/3 (minions leave, player adds good guys); defeating him wins. 6500 HP, drawn twice as big, boss health bar. Every 3s (2s when below half HP) does the next action: Skull Shower (skulls fall on 6 random good guys, 40 each; dodge by moving), Rise minions (3 random bad guys, max 8; when angry always 10, no max, space allowing), Bone Throw (70 at the strongest good guy), Weakness Curse (all good guys half damage and can't be healed — heal powers, regen, life steal — for 12s; a break lifts it), Bone Mend (heal 20% if hurt; blocked, wasting the turn, while a good guy wearing healing clothes — heal, regen or life steal power — is on the field). Immune to suck, stun and charm | reward 200 |
| Invisible Ball Bad Guy | Rolls an invisible ball down its own row (fires when a good guy is in its row within 6); the ball passes through the first good guy, turns visible, hits the next one for 30 and stops; rolls to the back of the castle. Introduced in Level 3 | hp 110, 30 dmg every 2s, reward 30 |

Later versions add bad guys; `BAD_GUY_DEFS` is data-only so additions require no engine changes beyond special abilities.

## 8. Levels

- Data-driven, same shape as ggvbg `LEVELS`, extended with `playerZone: {colMin, colMax}`, `enemyZone`, `startMoney`, `units` (unlocked roster), `rocks`, `pools`, and `waves: [{ spawns: [{type, row, col}] }]`.
- 13 levels: level 1 teaches place + Start Wave with Money Man and Boomerang Man; each later level unlocks one good guy, so all 14 are available by level 13.
- Loadout: up to 7 good guys (one tray row). The prepare screen appears from level 7, when more than 7 are unlocked. It defaults to new units, then the last loadout used.
- Five named save slots (`ggvbg2.save1`..`save5` in localStorage), chosen on the start screen; a new save asks for a name (HTML text box over the canvas, max 16 characters) and can be renamed; each holds unlocked/cleared levels, last loadout, coins and clothes. The pre-slots save (`ggvbg2.progress`) becomes Save 1. Delete takes two taps. Sandbox saves nothing.
- Starting a new save plays an intro: black screen fading in over 3s, a looping mini fight beside "Floor 1" and "Side by Side"; tap (after 1s) starts Level 1.
- Unlock: each level introduces one good guy, as ggvbg.
- Endless: formation generator scales bad-guy count/mix per wave; reinforcements between waves; score = waves survived.

## 8a. Sandbox

- Every good guy, $2000, no progress saved, no wave limit.
- The player also places the bad guys: a Good Guys / Bad Guys button in the HUD switches the tray; bad guys are free and go on free cells in the enemy zone; tapping a placed bad guy removes it.
- Start Wave fights the placed bad guys; after a win the same setup returns for the next wave. Starts with a small default setup.

## 8b. Wardrobe

- Opens after Level 5 is beaten; Wardrobe button on the menu.
- Coins (saved): 20 per level win, replays included; Sandbox = 0.
- Random Clothes box: 30 coins for a random item for the selected good guy only (no duplicates for that good guy), weighted by rarity: Common 20, Uncommon 15, Rare 10, Legendary 5 per item. The item is put on straight away.
- Clothes belong to the good guy type that found them; unfound items are never shown (`js/data/clothes.js`).
- Shirts add HP (+15/30/50/75%: Common..Legendary); hats add damage, or income for Money Man (+10/20/35/50%). Pure upgrades.
- 100 items: 50 shirts and 50 hats (per slot: 20 Common, 15 Uncommon, 10 Rare, 5 Legendary). Roll odds per rarity group: Common 50%, Uncommon 30%, Rare 15%, Legendary 5%, split evenly within the group. Full list in `js/data/clothes.js`. Earlier set of 24: Shirts: Leather Vest, Hawaiian Shirt, Cozy Hoodie / Chain Mail, Pirate Coat, Fancy Tuxedo / Knight Armor, Ninja Suit, Wizard Robe / Golden Armor, Hero Cape, Dragon Scales. Hats: Bandana, Party Hat, Chef Hat / Iron Helmet, Cowboy Hat, Propeller Cap / Viking Helmet, Wizard Hat, Pirate Hat / Crown, Angel Halo, Dragon Helmet.
- Wardrobe screen: Shirts / Hats tabs, 15 cards per page with Prev/Next; each card shows the good guy wearing that item.
- Wearable: good guys who are people and stay on the field (not walls, bombs, Axe Man). Clothes show on the character everywhere.

## 8c. Clothes powers

- Every item keeps its HP/damage bonus and also has a named power (`POWERS` in `js/data/clothes.js`, engine in `js/powers.js`).
- 18 power types: suck up (instant defeat, reward paid), damage, chain, area (near / row / rows / all / around a random bad guy), poison, stun, slow, weaken (half damage), charm (bad guy attacks other bad guys), heal, shield (unhittable), rage (faster attacks), coins; always-on: regen, thorns, dodge, life steal, last stand (once per level or wave).
- Timed powers count fighting time across the level; if there is nothing to do (e.g. nobody hurt) the power waits ready. Rarer items have stronger, more frequent powers.
- Example: Hawaiian Shirt "Flower Suck": every 15s sucks up the nearest bad guy.
- Wardrobe preview lists each worn item's power; powers show a floating name, beams/rings, and status markers (shield bubble, stun stars, charm heart, poison, weaken, rage).

## 9. Testing

- Manual play-through per milestone.
- Pure-function unit checks (node, no framework) for: targeting, heal formula, damage, reward math, save/load.
- Touch: Chrome device emulation plus a physical phone.

## 10. Open questions (data gaps)

1. Range metric for any-to-any: Chebyshev (diagonals count as 1), Manhattan, or Euclidean. (Current build: Chebyshev.)
2. Targeting priority: nearest, lowest HP, or unit-specific; and the same for bad guys (nearest good guy? Walls draw fire?). (Current build: nearest, ties to lowest HP, both sides.)
3. Money Man income: only during battle, or also during placement. (Current build: battle only, $25 per 5s, paused while nobody is in range.)
4. Lose condition: all good guys defeated, or also "no money and no units to place". (Current build: all good guys defeated, or bad guys remain and no good guy can attack.)
5. Pull-back: free, costs time, or refunds/loses money. Allowed while a unit is in combat? (Current build: tap a good guy, tap an empty cell to move it; free, any phase, HP kept, no selling.)
6. Do defeated good guys ever return, or are they lost for the level (assumed lost)?
7. Reward for defeating bad guys: credited immediately or at wave clear. (Current build: immediately.)
8. Sprite size and style guide (art direction for AI generation).
9. Sound: in scope or deferred.
10. Working title and hosting target (local only, GitHub Pages, other).

## 11. Immediate next steps

1. Answer open questions 1-5 (they block combat design).
2. Approve milestone order.
3. Begin Milestone 1.
