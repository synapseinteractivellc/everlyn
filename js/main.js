// js/main.js
import { composeGame } from "./boot/composeGame.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load all your JSON definitions (via loadContent inside composeGame)
    const { defs, state, actionController } = await composeGame({
      onLog: (msg) => console.log(msg),
      onStateChange: (s) => renderGame(s, defs),
      onSwitchAction: (id) => highlightButton(id),
    });

    // Keep handy for debugging
    window.Game = { defs, state, actionController };

    // Kick off the first render or game loop
    renderGame(state, defs);
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<pre style="color:red;">Failed to load game content:\n${err.message}</pre>`;
  }
});

// Example simple renderer
function renderGame(state, defs) {
    console.log(state);
    console.log(defs);
  const root = document.getElementById("game-container");
  root.innerHTML = `
    <h1>Everlyn RPG</h1>
    <p>Resources:</p>
    <ul>${Object.values(state.resources)
      .map(r => `<li>${defs.resources[r.id].name}: ${r.amount}</li>`)
      .join("")}</ul>
    <p>Skills:</p>
    <ul>${Object.values(state.skills)
      .map(s => `<li>${defs.skills[s.id].name}: Level - ${s.level} - XP - ${s.experience}</li>`)
      .join("")}</ul>
  `;
}

function highlightButton(actionId) {
  console.log("Switched to action:", actionId);
}
