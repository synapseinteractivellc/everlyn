/*
 * main.js
 *
 * Sets up the user interface for character creation and action
 * execution.  It relies on the API exposed by action.js to load
 * available actions and perform them.  For the minimal MVP, the
 * only action supported is "beg"; additional actions, skills or
 * systems can be added later without changing this basic structure.
 */

window.addEventListener('DOMContentLoaded', async () => {
  // Load all defined actions.  Each action may specify costs,
  // rewards, capacity modifiers and purchase limits.  The
  // `unlocked` property determines initial visibility, but it can be
  // updated by State.updateActionUnlocks() at runtime.
  const actions = await window.Actions.loadActions();
  // Create a fresh game state
  const state = window.State.createState();

  // Handle character creation form submission
  const form = document.getElementById('character-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('character-name');
    const selectedClassInput = document.querySelector('input[name="class"]:checked');
    const name = nameInput.value.trim();
    const selectedClass = selectedClassInput ? selectedClassInput.value : '';
    if (!name) {
      alert('Please enter a character name.');
      return;
    }
    // Store player details on the state object
    state.name = name;
    state.class = selectedClass;
    // Hide creation screen and show game screen
    document.getElementById('creation').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    // Render action buttons into the container
    window.UI.renderActions(actions, state);
    // Ensure actions are unlocked appropriately before first render
    window.State.updateActionUnlocks(state, actions);
    // Draw the UI to reflect the initial state
    window.UI.updateUI(state, actions);
  });
});