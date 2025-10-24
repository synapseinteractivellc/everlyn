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

    // Cache completion counts per id to detect changes
    this.prevCompletionCounts = {};
  }

  update(state, defs) {
    if (!state || !defs) return;

    const actions = state.actions ? Object.values(state.actions) : [];
    const unlocked = actions.filter((a) => a.unlocked === true);

    const unlockedRests = unlocked.filter((a) => defs.actions[a.id].type === "rest");    
    const unlockedActions = unlocked.filter((a) => defs.actions[a.id].type === "action");
    const unlockedPurchases = unlocked.filter((a) => defs.actions[a.id].type === "purchase");

    const availableRests = [];
    const availableActions = [];
    const availablePurchases = [];

    for (const a of unlockedRests) {
      const def = defs.actions?.[a.id] ?? {};
      const max = def?.maxCompletions ?? Infinity;
      const done = a?.completionCount ?? 0;
      if (done < max) availableRests.push(a);
    }

    for (const a of unlockedActions) {
      const def = defs.actions?.[a.id] ?? {};
      const max = def?.maxCompletions ?? Infinity;
      const done = a?.completionCount ?? 0;
      if (done < max) availableActions.push(a);
    }

    for (const a of unlockedPurchases) {
      const def = defs.actions?.[a.id] ?? {};
      const max = def?.maxCompletions ?? Infinity;
      const done = a?.completionCount ?? 0;
      if (done < max) availablePurchases.push(a);
    }

    // Get current button IDs
    const restIds = availableRests.map((a) => a.id);
    const actionIds = availableActions.map((a) => a.id);
    const purchaseIds = availablePurchases.map((a) => a.id);

    // Determine whether ids or completion counts changed
    const restChanged = !this.arraysEqual(restIds, this.prevRestIds);
    const actionChanged = !this.arraysEqual(actionIds, this.prevActionIds);
    const purchaseChanged = !this.arraysEqual(purchaseIds, this.prevPurchaseIds);

    // Build a map of current completion counts
    const currentCompletionCounts = {};
    [...availableRests, ...availableActions, ...availablePurchases].forEach(a => {
      currentCompletionCounts[a.id] = a.completionCount ?? 0;
    });

    // Helper to update or create buttons in a container according to an ordered id list
    const syncButtons = (container, ids, type, availableMap) => {
      if (!container) return;

      // Ensure container children are processed in the same logical order:
      // iterate ids in order, move existing buttons into place or create new ones
      const desiredSet = new Set(ids);
      const existingButtons = Array.from(container.querySelectorAll(type === 'purchase' ? '.purchase-button' : '.action-button'));

      // Update or create buttons in order
      ids.forEach(id => {
        let btn = container.querySelector(`[data-action-id="${id}"]`);
        const a = availableMap[id];
        if (!btn) {
          btn = this.createActionButton(a, defs, type);
        } else {
          // update completion count text if changed
          const details = btn.querySelector('.action-details');
          const def = defs.actions?.[id] ?? {};
          const max = def?.maxCompletions;
          const done = a.completionCount ?? 0;
          let text;
          if (Number.isFinite(max)) {
            text = `${done}/${max}`;
          } else {
            text = `${done} Completions`;
          }
          if (details && details.textContent !== text) {
            details.textContent = text;
          }
          // also update tooltip in case costs/rewards changed
          btn.title = this.createToolTip(a, defs);
        }
        // appendChild will move the element if it already exists - keeps order
        container.appendChild(btn);
      });

      // Remove buttons that are no longer desired
      existingButtons.forEach(btn => {
        const id = btn.getAttribute('data-action-id');
        if (!desiredSet.has(id)) {
          btn.remove();
        }
      });
    };

    // Prepare quick lookup maps for available items
    const availableMap = {};
    availableRests.forEach(a => availableMap[a.id] = a);
    availableActions.forEach(a => availableMap[a.id] = a);
    availablePurchases.forEach(a => availableMap[a.id] = a);

    // Sync action buttons (rests + actions) if IDs changed or any completionCount changed
    const anyActionCountChanged = [...restIds, ...actionIds].some(id => this.prevCompletionCounts[id] !== currentCompletionCounts[id]);
    if (this.actionsContainer && (restChanged || actionChanged || anyActionCountChanged)) {
      const combinedIds = [...restIds, ...actionIds];
      syncButtons(this.actionsContainer, combinedIds, 'action', availableMap);
      this.prevRestIds = restIds;
      this.prevActionIds = actionIds;
    }

    // Sync purchases if needed
    const anyPurchaseCountChanged = purchaseIds.some(id => this.prevCompletionCounts[id] !== currentCompletionCounts[id]);
    if (this.purchasesContainer && (purchaseChanged || anyPurchaseCountChanged)) {
      syncButtons(this.purchasesContainer, purchaseIds, 'purchase', availableMap);
      this.prevPurchaseIds = purchaseIds;
    }

    // Update prevCompletionCounts for next tick
    Object.assign(this.prevCompletionCounts, currentCompletionCounts);
  }

  // Helper to compare arrays of IDs
  arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  createActionButton(a, defs, type = 'action') {
    // a: action state object, defs: game definitions, type: 'action'|'purchase'
    const id = a.id;
    const def = defs.actions?.[id] ?? {};

    const button = document.createElement('button');
    button.className = type === 'purchase' ? 'purchase-button' : 'action-button';
    button.setAttribute('data-action-id', id);

    // Tooltip
    const tooltip = this.createToolTip(a, defs);
    button.title = tooltip;

    // Name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'action-name';
    nameSpan.textContent = def?.name ?? id;
    button.appendChild(nameSpan);

    // Completion counts
    const completionCount = document.createElement('span');
    completionCount.className = 'action-details';
    const max = def?.maxCompletions;
    const done = a.completionCount ?? 0;
    if (Number.isFinite(max)) {
      completionCount.textContent = `${done}/${max}`;
    } else {
      completionCount.textContent = `${done} Completions`;
    }
    button.appendChild(completionCount);

    return button;
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