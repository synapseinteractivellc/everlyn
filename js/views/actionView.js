// js/views/actionView.js
export default class ActionView {
  constructor(actionController) {
    this.actionController = actionController;

    this.actionsContainer = document.getElementById("actions-container");
    this.purchasesContainer = document.getElementById("purchases-container");

    if (!this.actionsContainer) {
      console.error("[Everlyn] Missing #actions-container in DOM.");
      document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #actions-container in DOM.</pre>`
      );
    }
    if (!this.purchasesContainer) {
      console.error("[Everlyn] Missing #purchases-container in DOM.");
      document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #purchases-container in DOM.</pre>`
      );
    }

    // Event delegation for actions
    if (this.actionsContainer) {
      this.actionsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".action-btn");
        if (btn) {
          const actionId = btn.getAttribute("data-action-id");
          if (this.actionController?.startAction && actionId) {
            this.actionController.startAction(actionId);
          }
        }
      });
    }

    // Event delegation for purchases
    if (this.purchasesContainer) {
      this.purchasesContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".action-btn");
        if (btn) {
          const actionId = btn.getAttribute("data-action-id");
          if (this.actionController?.startAction && actionId) {
            this.actionController.startAction(actionId);
          }
        }
      });
    }

    // Cache previous button lists
    this.prevRestIds = [];
    this.prevActionIds = [];
    this.prevPurchaseIds = [];
  }

  update(state, defs) {
    if (!state || !defs) return;

    const actions = state.actions ? Object.values(state.actions) : [];
    const unlocked = actions.filter((a) => a.unlocked === true);

    const availableRests = unlocked.filter((a) => defs.actions[a.id].type === "rest");
    const availableActions = unlocked.filter((a) => defs.actions[a.id].type === "action");
    const availablePurchases = unlocked.filter((a) => defs.actions[a.id].type === "purchase");

    // Get current button IDs
    const restIds = availableRests.map((a) => a.id);
    const actionIds = availableActions.map((a) => a.id);
    const purchaseIds = availablePurchases.map((a) => a.id);

    // Only update if the button list has changed
    const restChanged = !this.arraysEqual(restIds, this.prevRestIds);
    const actionChanged = !this.arraysEqual(actionIds, this.prevActionIds);
    const purchaseChanged = !this.arraysEqual(purchaseIds, this.prevPurchaseIds);

    if (this.actionsContainer && (restChanged || actionChanged)) {
      this.actionsContainer.innerHTML = `
        
          ${availableRests
            .map(
              (a) =>
                `<button type="button" class="action-button" data-action-id="${a.id}">
                    ${defs.actions?.[a.id]?.name ?? a.id}
                </button>`
            )
            .join("")}
        
        
          ${availableActions
            .map(
              (a) =>
                `<button type="button" class="action-button" data-action-id="${a.id}">
                    ${defs.actions?.[a.id]?.name ?? a.id}
                </button>`
            )
            .join("")}
        `;
      this.prevRestIds = restIds;
      this.prevActionIds = actionIds;
    }

    if (this.purchasesContainer && purchaseChanged) {
      this.purchasesContainer.innerHTML = 
        `${availablePurchases
            .map(
              (a) =>
                `<button type="button" class="purchase-button" data-action-id="${a.id}">
                    ${defs.actions?.[a.id]?.name ?? a.id}
                </button>`
            )
            .join("")}
        `;
      this.prevPurchaseIds = purchaseIds;
    }
  }

  // Helper to compare arrays of IDs
  arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}