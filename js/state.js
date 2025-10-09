/*
 * state.js
 *
 * Defines a simple API for creating and managing the game state.  It also
 * contains logic for unlocking and locking actions based on resource
 * thresholds and purchase limits.  Separating state management from the
 * UI logic allows the game to scale cleanly as more systems (e.g. skills,
 * housing, minions) are introduced.
 */

// Factory function to create a fresh game state.  The returned object holds
// all mutable player data.  Additional fields can be added here as new
// systems are introduced (e.g. skills, inventory, housing).
function createState() {
  return {
    name: '',
    class: '',
    level: 0,
    gold: 0,
    goldMax: 10,    
    life: 10,
    lifeMax: 10,
    stamina: 10,
    staminaMax: 10,
    isPerforming: false,
    // Track how many times each upgrade (e.g. coinpurse) has been purchased.
    upgrades: {},
    // A map of action IDs to their corresponding DOM button elements.  This
    // is populated by UI.renderActions() and is used by UI.updateUI() to
    // enable/disable or hide individual buttons.
    actionButtons: {},
  };
}

/*
 * updateActionUnlocks(state, actions)
 *
 * Examine each action definition and adjust its `unlocked` property based
 * on the player's current resources and purchase counts.  The logic
 * implements the following rules:
 *
 * 1. If an action has a defined `maxPurchases` and the player has
 *    purchased it that many times, the action is permanently locked
 *    (`unlocked = false`).
 * 2. For upgrade-type actions with a gold cost, the action remains
 *    locked until the player first accumulates enough gold to afford it.
 *    Once unlocked, it stays unlocked even if the player's gold drops
 *    below the cost afterwards.
 * 3. Actions that start as unlocked (e.g. `beg` and `rest`) remain so
 *    unless rule (1) applies.
 */
function updateActionUnlocks(state, actions) {
  Object.keys(actions).forEach((id) => {
    const action = actions[id];
    // Check purchase limit: if reached, permanently lock the action
    const purchasedCount = state.upgrades[id] || 0;
    const maxPurchases = typeof action.maxPurchases === 'number' ? action.maxPurchases : Infinity;
    if (purchasedCount >= maxPurchases) {
      action.unlocked = false;
      return;
    }
    // If the action has a gold cost, unlock it the first time the
    // player has enough gold to pay that cost.  Once unlocked, it
    // should not be re-locked if the player's gold falls below the
    // cost again.
    if (typeof action.goldCost === 'number') {
      // If not yet unlocked and the player has enough gold, unlock it
      if (!action.unlocked && state.gold >= action.goldCost) {
        action.unlocked = true;
      }
    }
    // No unlocking logic needed for actions that start unlocked.
  });
}

// Expose factory and update functions on the global State object
window.State = {
  createState,
  updateActionUnlocks,
};