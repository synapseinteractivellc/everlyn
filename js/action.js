/*
 * action.js
 *
 * Provides a simple API for loading action definitions from a JSON
 * file and performing actions by applying costs, waiting for a
 * configured duration and awarding random rewards.  This module does
 * not manage character skills, housing or stats—those systems can be
 * built using a similar pattern.  Instead, it operates on a plain
 * state object supplied by the caller and updates it directly.
 */

// Load actions from the data file.  Returns a promise that resolves
// to an object keyed by action ID.
function loadActions() {
  return fetch('data/action.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load action definitions');
      }
      return response.json();
    })
    .then((data) => {
      // Normalize unlocked values: if provided as strings in JSON, convert to boolean
      Object.keys(data).forEach((id) => {
        const action = data[id];
        if (typeof action.unlocked === 'string') {
          action.unlocked = action.unlocked === 'true';
        }
      });
      return data;
    })
    .catch((err) => {
      console.error(err);
      return {};
    });
}

/*
 * Perform a given action.  You must pass in a state object (which
 * should have at least `gold`, `stamina` and `isPerforming` fields),
 * the action definition, and a callback to update the UI.  If the
 * caller attempts to perform an action while another is in progress
 * or without sufficient stamina, the function will alert the user
 * and return immediately.
 */
function performAction(state, action, updateUI) {
  // Prevent overlapping actions
  if (state.isPerforming) {
    return;
  }
  // Check purchase limit (for upgrade-type actions)
  const purchasedCount = state.upgrades && state.upgrades[action.id] ? state.upgrades[action.id] : 0;
  if (typeof action.maxPurchases === 'number' && purchasedCount >= action.maxPurchases) {
    alert('You have already purchased this upgrade the maximum number of times.');
    return;
  }
  // Check stamina requirement
  if (typeof action.staminaCost === 'number' && state.stamina < action.staminaCost) {
    alert('Not enough stamina to perform this action.');
    return;
  }
  // Check gold requirement
  if (typeof action.goldCost === 'number' && state.gold < action.goldCost) {
    alert('Not enough gold to perform this action.');
    return;
  }
  state.isPerforming = true;
  // Immediately reflect state in UI
  updateUI(state);

  // Show and reset the progress bar
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress');
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';

  const duration = action.duration || 0;
  const interval = 50;
  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed += interval;
    const pct = duration > 0 ? Math.min(1, elapsed / duration) : 1;
    progressBar.style.width = pct * 100 + '%';
    if (elapsed >= duration) {
      clearInterval(timer);
      // Apply stamina cost
      if (typeof action.staminaCost === 'number') {
        state.stamina = Math.max(0, state.stamina - action.staminaCost);
      }
      // Apply gold cost
      if (typeof action.goldCost === 'number') {
        state.gold = Math.max(0, state.gold - action.goldCost);
      }
      // Apply stamina reward (for rest)
      if (typeof action.staminaReward === 'number') {
        state.stamina = Math.min(state.staminaMax ?? Infinity, state.stamina + action.staminaReward);
      }
      // Apply gold reward (random within range)
      if (typeof action.goldRewardMin === 'number' && typeof action.goldRewardMax === 'number') {
        const min = action.goldRewardMin;
        const max = action.goldRewardMax;
        const reward = Math.floor(Math.random() * (max - min + 1)) + min;
        state.gold = Math.min(state.goldMax ?? Infinity, state.gold + reward);
      }
      // Apply gold capacity increase (for upgrades)
      if (typeof action.goldMaxIncrease === 'number') {
        state.goldMax = (state.goldMax ?? 0) + action.goldMaxIncrease;
      }
      // Track number of times this upgrade has been purchased
      if (typeof action.maxPurchases === 'number') {
        if (!state.upgrades) {
          state.upgrades = {};
        }
        state.upgrades[action.id] = purchasedCount + 1;
      }
      // Hide progress bar after completion
      progressBar.style.width = '0%';
      progressContainer.style.display = 'none';
      state.isPerforming = false;
      // Update the UI after the action completes
      updateUI(state);
    }
  }, interval);
}

// Expose functions to the global scope so they can be used in main.js
window.Actions = {
  loadActions,
  performAction,
};