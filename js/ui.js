/*
 * ui.js
 *
 * Encapsulates all user interface rendering and updating logic.  The
 * functions in this module operate on a given game state and the set
 * of action definitions.  By separating UI concerns into their own
 * module, we avoid cluttering other parts of the code with DOM
 * manipulation and provide a single place to modify how the game
 * interface behaves.
 */

/**
 * Render buttons for each action definition.  Buttons are created
 * regardless of whether the action is currently unlocked; UI.updateUI
 * will handle showing or hiding them based on the `unlocked` flag.
 *
 * @param {Object} actions - Map of action definitions keyed by ID.
 * @param {Object} state   - Current game state; will be mutated to
 *                           store references to button elements.
 */
function renderActions(actions, state) {
  const container = document.getElementById('actions-container');
  container.innerHTML = '';
  // Clear any previously stored button references
  state.actionButtons = {};
  // Create a button for each action definition
  Object.keys(actions).forEach((id) => {
    const action = actions[id];
    const btn = document.createElement('button');
    btn.id = `action-${id}`;
    btn.textContent = action.name;
    // When an action button is clicked, perform the action.  After
    // completion, update unlocks and UI.
    btn.addEventListener('click', () => {
      // Prevent clicks if another action is already in progress
      if (state.isPerforming) {
        return;
      }
      window.Actions.performAction(state, action, () => {
        // After the action finishes, update unlock states and UI
        window.State.updateActionUnlocks(state, actions);
        updateUI(state, actions);
      });
      // Immediately reflect in-progress state (disable buttons, show
      // progress bar) before the action completes
      updateUI(state, actions);
    });
    container.appendChild(btn);
    // Store reference for later updates
    state.actionButtons[id] = btn;
  });
}

/**
 * Update the UI to reflect the current state of the game.  This
 * includes player details, resource values and action button
 * visibility/availability.
 *
 * @param {Object} state   - Current game state (mutated by actions).
 * @param {Object} actions - Map of action definitions.
 */
function updateUI(state, actions) {
  // Update character info
  document.getElementById('player-name').textContent = state.name;
  document.getElementById('player-class').textContent = state.class;
  document.getElementById('player-level').textContent = state.level;
  // Update resource counters and maxima
  document.getElementById('gold-amount').textContent = state.gold;
  document.getElementById('gold-max').textContent = state.goldMax;
  document.getElementById('life-amount').textContent = state.life;
  document.getElementById('life-max').textContent = state.lifeMax;
  document.getElementById('stamina-amount').textContent = state.stamina;
  document.getElementById('stamina-max').textContent = state.staminaMax;

  // Update each action button
  Object.keys(actions).forEach((id) => {
    const action = actions[id];
    const btn = state.actionButtons[id];
    if (!btn) return;
    // Show or hide the button based on the unlocked flag
    if (!action.unlocked) {
      btn.style.display = 'none';
      return;
    } else {
      btn.style.display = 'block';
    }
    // Determine whether the button should be disabled
    let disabled = false;
    // Disable all buttons if an action is currently running
    if (state.isPerforming) {
      disabled = true;
    }
    // Require sufficient stamina to perform the action
    if (typeof action.staminaCost === 'number' && state.stamina < action.staminaCost) {
      disabled = true;
    }
    // Require sufficient life to perform the action
    if (typeof action.lifeCost === 'number' && state.life < action.lifeCost) {
      disabled = true;
    }
    // Require sufficient gold to perform the action
    if (typeof action.goldCost === 'number' && state.gold < action.goldCost) {
      disabled = true;
    }
    // Disable the rest action when stamina is full
    if (typeof action.staminaReward === 'number' && state.stamina >= state.staminaMax) {
      disabled = true;
    }
    btn.disabled = disabled;
  });
}

// Expose UI functions globally
window.UI = {
  renderActions,
  updateUI,
};