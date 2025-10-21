// js/views/actionLogView.js

export default class ActionLogView {
    constructor(actionController) {
        this.actionController = actionController;
        this.currentAction = document.getElementById("action-name");
        this.currentActionProgressContainer = document.getElementById("current-action-progress-container");
        this.actionLog = document.getElementById("action-log");


        if (!this.currentAction) {
        console.error("[Everlyn] Missing #action-name in DOM.");
        document.body.insertAdjacentHTML(
            "beforeend",
            `<pre style="color:red;">Missing #action-name in DOM.</pre>`
        );
        }
        if (!this.currentActionProgressContainer) {
        console.error("[Everlyn] Missing #current-action-progress-container in DOM.");
        document.body.insertAdjacentHTML(
            "beforeend",
            `<pre style="color:red;">Missing #current-action-progress-container in DOM.</pre>`
        );
        }
        if (!this.actionLog) {
        console.error("[Everlyn] Missing #action-log in DOM.");
        document.body.insertAdjacentHTML(
            "beforeend",
            `<pre style="color:red;">Missing #action-log in DOM.</pre>`
        );
        }
    }

    update(state, defs) {
        if (!state || !defs || !this.currentAction || !this.currentActionProgressContainer || !this.actionLog) return;

        const currentActionId = state.currentAction;
        const actionLog = state.actionLog ? Object.values(state.actionLog) : [];

        // Handle current action name and progress
        if (this.currentAction && this.currentActionProgressContainer) {
            // If no current action, show "None" and 0% progress
            if (!currentActionId) {
                this.currentAction.innerHTML = "None";
                this.currentActionProgressContainer.innerHTML = `
                <div class="progress-bar progress-action">
                    <div class="progress-bar-fill" style="width: 0%"></div>
                </div>
                `;
            } else {
                // Get the action object from state
                const actionObj = state.actions?.[currentActionId];
                const actionDef = defs.actions?.[currentActionId];     

                // Only reattach stop button handler when the current action actually changes
                if (this._lastCurrentActionId !== currentActionId) {
                    console.log("Fire: ", this._lastCurrentActionId, ". Start: ", currentActionId);
                    this._lastCurrentActionId = currentActionId;
                    this.currentAction.innerHTML = `${actionDef?.name ?? currentActionId} <button class="stop-action-btn" aria-label="Stop current action">×</button>`;

                    const stopBtn = this.currentAction.querySelector('.stop-action-btn');
                    if (stopBtn) {
                        console.log("Stop click");
                        // Replace the node to clear any previous listeners (avoids duplicate handlers on repeated updates)
                        const newBtn = stopBtn.cloneNode(true);
                        stopBtn.parentNode.replaceChild(newBtn, stopBtn);
                        newBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            const controller = this.actionController;
                            if (controller && typeof controller.stopCurrentAction === 'function') {
                                controller.stopCurrentAction();
                            } else {
                                console.error('[Everlyn] actionController.stopCurrentAction is not available.');
                            }
                        });
                    }
                }

                // Safely get currentProgress (should be between 0 and 1)
                let currentProgress = 0;
                if (actionObj && typeof actionObj.currentProgress === "number") {
                    // Clamp between 0 and 1, then convert to percent

                    currentProgress = Math.max(0, Math.min(1, actionObj.currentProgress)) * 100;
                }
                this.currentActionProgressContainer.innerHTML = `
                <div class="progress-bar progress-action" style="width: ${currentProgress}%">
                    ${Math.floor(currentProgress)}%
                </div>
                `;
            }
        }

        // Handle action log
        if (this.actionLog) {
        this.actionLog.innerHTML = "";
        if (actionLog.length > 0) {
            actionLog.forEach(entry => {
            const entryDiv = document.createElement("div");
            entryDiv.className = "log-entry";
            entryDiv.textContent = entry.message ? entry.message : JSON.stringify(entry);
            this.actionLog.appendChild(entryDiv);
            });
        }
        }
    }
}