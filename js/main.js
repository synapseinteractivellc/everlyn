// js/main.js
import { composeGame } from "./boot/composeGame.js";

// Resolve container once, after DOM is ready, and guard all renders.
let rootEl = null;
let rootE2 = null;

window.addEventListener("DOMContentLoaded", async () => {
  rootEl = document.getElementById("game1");
  rootE2 = document.getElementById("game2");
  if (!rootEl) {
    console.error(
      "[Everlyn] Missing #game1. Is the deployed HTML the one you expect?"
    );
    // Show a friendly message so the page doesn't look dead.
    document.body.insertAdjacentHTML(
      "beforeend",
      `<pre style="color:red;">Missing #game1 in DOM.</pre>`
    );
    return; // bail early; no container to render into
  }
  if (!rootE2) {
    console.error(
      "[Everlyn] Missing #game2. Is the deployed HTML the one you expect?"
    );
    // Show a friendly message so the page doesn't look dead.
    document.body.insertAdjacentHTML(
      "beforeend",
      `<pre style="color:red;">Missing #game2 in DOM.</pre>`
    );
    return; // bail early; no container to render into
  }

  try {
    const { defs, state, actionController } = await composeGame({
      onLog: (msg) => console.log(msg),

      // Important: only render if the container still exists
      onStateChange: (s) => {
        if (!rootEl || !rootE2) {
          console.warn("[Everlyn] onStateChange fired before container ready.");
          return;
        }
        renderGame(s, defs);
      },

      onSwitchAction: (id) => highlightButton(id),
    });

    window.Game = { defs, state, actionController };
    renderGame(state, defs);
    // Start the game loop:
    let lastTick = performance.now();
    function loop(now) {
      const delta = now - lastTick;
      lastTick = now;
      actionController.update(delta);
      updateGame(state, defs);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<pre style="color:red;">Failed to load game content:\n${err.message}</pre>`;
  }
});

function renderGame(state, defs) {
  if (!rootEl || !rootE2) {
    console.warn("[Everlyn] renderGame() called without a container.");
    return;
  }
  // Extra safety: defs/state might be undefined during early callbacks
  if (!state || !defs) {
    console.warn("[Everlyn] renderGame() missing state/defs, skipping this tick.");
    return;
  }
  updateGame(state, defs);
  // Optional: guard against undefined collections to avoid secondary errors
  const actions = state.actions ? Object.values(state.actions) : [];  
  let unlockedActions = actions.filter(a => a.unlocked === true);

  rootE2.innerHTML = `
    <p>Actions:</p>
    <ul>${unlockedActions
      .map((a) => `<li><button type="button" class="action-btn" data-action-id="${a.id}">
              ${defs.actions?.[a.id]?.name ?? a.id}
            </button></li>`)
      .join("")}</ul>
  `;
  
  // Add click handlers for action buttons
  rootE2.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const actionId = btn.getAttribute("data-action-id");
      if (window.Game?.actionController?.startAction && actionId) {
        window.Game.actionController.startAction(actionId);
      }
    });
  });
}

function highlightButton(actionId) {
  console.log("Switched to action:", actionId);
}

function updateGame(state, defs) {
  // Optional: guard against undefined collections to avoid secondary errors
  const resources = state.resources ? Object.values(state.resources) : [];
  const skills = state.skills ? Object.values(state.skills) : [];
  const classes = state.classes ? Object.values(state.classes) : [];

  let unlockedResources = resources.filter(r => r.unlocked === true);
  let unlockedSkills = skills.filter(s => s.unlocked === true);
  let unlockedClasses = classes.filter(c => c.unlocked === true);

  rootEl.innerHTML = `
    <h1>Everlyn RPG</h1>
    <p>Updated: October 15th. Rebuilding UI after switching to new data structure.</p>
    <p>Resources:</p>
    <ul>${unlockedResources
      .map((r) => `<li>${defs.resources?.[r.id]?.name ?? r.id}: ${r.amount}/${r.maximum}</li>`)
      .join("")}</ul>
    <p>Skills:</p>
    <ul>${unlockedSkills
      .map(
        (s) =>
          `<li>${defs.skills?.[s.id]?.name ?? s.id}: Level - ${s.level} - XP - ${s.experience}/${s.nextLevelExperience}</li>`
      )
      .join("")}</ul>
    <p>Classes:</p>
    <ul>${unlockedClasses
      .map(
        (c) =>
          `<li>${defs.classes?.[c.id]?.name ?? c.id}</li>`
      )
      .join("")}</ul>
  `;
}

function gameTick() {
  const now = Date.now();
  const deltaTime = now - this.lastTick;
  this.lastTick = now;
  
  // Update game state
  this.actionController.update(deltaTime);
}
