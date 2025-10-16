// js//views/actionView.js

const actions = state.actions ? Object.values(state.actions) : [];  
let unlockedActions = actions.filter(a => a.unlocked === true);

let availableActions = unlockedActions.filter(a => a.type === "actions");
let availablePurchases = unlockedActions.filter(a => a.type === "purchase");

let actionsContainer = null;
let purchasesContainer = null;
actionsContainer = document.getElementById("actions-container");
purchasesContainer = document.getElementById("purchases-container");

if (!actionsContainer) {
    console.error(
        "[Everlyn] Missing #actionsContainer. Is the deployed HTML the one you expect?"
    );
    // Show a friendly message so the page doesn't look dead.
    document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #actionsContainer in DOM.</pre>`
    );
    return; // bail early; no container to render into
}

if (!purchasesContainer) {
    console.error(
        "[Everlyn] Missing #purchasesContainer. Is the deployed HTML the one you expect?"
    );
    // Show a friendly message so the page doesn't look dead.
    document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #purchasesContainer in DOM.</pre>`
    );
    return; // bail early; no container to render into
}


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