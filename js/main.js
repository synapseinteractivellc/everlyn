// js/main.js
import { composeGame } from "./boot/composeGame.js";

// Resolve container once, after DOM is ready, and guard all renders.
let rootEl = null;

window.addEventListener("DOMContentLoaded", async () => {
  rootEl = document.getElementById("game-container");
  if (!rootEl) {
    console.error(
      "[Everlyn] Missing #game-container. Is the deployed HTML the one you expect?"
    );
    // Show a friendly message so the page doesn't look dead.
    document.body.insertAdjacentHTML(
      "beforeend",
      `<pre style="color:red;">Missing #game-container in DOM.</pre>`
    );
    return; // bail early; no container to render into
  }

  try {
    const { defs, state, actionController } = await composeGame({
      onLog: (msg) => console.log(msg),

      // Important: only render if the container still exists
      onStateChange: (s) => {
        if (!rootEl) {
          console.warn("[Everlyn] onStateChange fired before container ready.");
          return;
        }
        renderGame(s, defs);
      },

      onSwitchAction: (id) => highlightButton(id),
    });

    window.Game = { defs, state, actionController };
    renderGame(state, defs);
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<pre style="color:red;">Failed to load game content:\n${err.message}</pre>`;
  }
});

function renderGame(state, defs) {
  if (!rootEl) {
    console.warn("[Everlyn] renderGame() called without a container.");
    return;
  }
  // Extra safety: defs/state might be undefined during early callbacks
  if (!state || !defs) {
    console.warn("[Everlyn] renderGame() missing state/defs, skipping this tick.");
    return;
  }

  // Optional: guard against undefined collections to avoid secondary errors
  const resources = state.resources ? Object.values(state.resources) : [];
  const skills = state.skills ? Object.values(state.skills) : [];

  rootEl.innerHTML = `
    <h1>Everlyn RPG</h1>
    <p>Resources:</p>
    <ul>${resources
      .map((r) => `<li>${defs.resources?.[r.id]?.name ?? r.id}: ${r.amount}</li>`)
      .join("")}</ul>
    <p>Skills:</p>
    <ul>${skills
      .map(
        (s) =>
          `<li>${defs.skills?.[s.id]?.name ?? s.id}: Level - ${s.level} - XP - ${s.experience}</li>`
      )
      .join("")}</ul>
  `;
}

function highlightButton(actionId) {
  console.log("Switched to action:", actionId);
}
