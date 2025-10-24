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
        const btn = e.target.closest(".action-button");
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
        const btn = e.target.closest(".purchase-button");
        console.log(btn);
        if (btn) {
          const actionId = btn.getAttribute("data-action-id");
          if (this.actionController?.startAction && actionId) {
            console.log("Click: ", actionId);
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

    const unlockedRests = unlocked.filter((a) => defs.actions[a.id].type === "rest");    
    const unlockedActions = unlocked.filter((a) => defs.actions[a.id].type === "action");
    const unlockedPurchases = unlocked.filter((a) => defs.actions[a.id].type === "purchase");

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
      this.actionsContainer.innerHTML = '';
      availableRests.forEach((a) => {
        const button = document.createElement('button');
        button.className = 'action-button';
        button.setAttribute('data-action-id', a.id);
        // Tooltip
        let tooltip = this.createToolTip(a, defs);
        button.title = tooltip;

        // Name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'action-name';
        nameSpan.textContent = defs.actions?.[a.id]?.name ?? a.id
        button.appendChild(nameSpan);

        this.actionsContainer.appendChild(button);
      });

      availableActions.forEach((a) => {
        const button = document.createElement('button');
        button.className = 'action-button';
        button.setAttribute('data-action-id', a.id)
        // Tooltip
        let tooltip = this.createToolTip(a, defs);
        button.title = tooltip;

        // Name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'action-name';
        nameSpan.textContent = defs.actions?.[a.id]?.name ?? a.id
        button.appendChild(nameSpan);

        this.actionsContainer.appendChild(button);
      });
        
      this.prevRestIds = restIds;
      this.prevActionIds = actionIds;
    }

    if (this.purchasesContainer && purchaseChanged) {
      this.purchasesContainer.innerHTML = '';
      availablePurchases.forEach((a) => {
        const button = document.createElement('button');
        button.setAttribute('data-action-id', a.id)
        button.className = 'purchase-button';
        // Tooltip
        let tooltip = this.createToolTip(a, defs);
        button.title = tooltip;

        // Name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'action-name';
        nameSpan.textContent = defs.actions?.[a.id]?.name ?? a.id
        button.appendChild(nameSpan);
        
        this.purchasesContainer.appendChild(button);
      });
  
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

  createToolTip(a, defs) {
    const tooltip = [];
    // Description
    const desc = defs.actions[a.id].description;
    tooltip.push(`${desc}`);

    // Costs
    const cost = a.cost;
    if (cost && cost.length > 0) {
      tooltip.push('Costs:');
      cost.forEach(c => {
        tooltip.push(`- ${c.amt} ${c.resource}`);
      });
    }

    // Rewards
    const rewards = a.reward;
    if (rewards && rewards.length > 0) {
      tooltip.push('Rewards:');
      rewards.forEach(r => {
        if (r?.resource) {
          if (r.min !== undefined && r.max !== undefined) {
            if (r.min === r.max) {
              tooltip.push(`+ ${r.min} ${defs.resources[r.resource].name ?? r.resource}`);
            } else {
              tooltip.push(`+ ${r.min} – ${r.max} ${r.resource}`);
            }
          } else if (r.amount !== undefined) {
            tooltip.push(`+ ${r.amount} ${r.resource}`);
          } else if (r.maxChange !== undefined) {
            tooltip.push(`Increase max capacity of ${defs.resources[r.resource].name ?? r.resource} by ${r.maxChange}`);
          }
        } else if (r.skill) {
          tooltip.push(`+ ${r.amt} ${defs.skills[r.skill].name ?? r.skill} XP`);
        } else {
          // fallback for unknown reward types
          tooltip.push(`Unknown`);
        }
      });
    }

    // Join with newlines
    return tooltip.join('\n');
  }
}