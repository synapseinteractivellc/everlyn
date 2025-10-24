// js/controller/actionController.js
export class ActionController {
  constructor(state, actionModel, { onLog, onStateChange } = {}) {
    this.model = actionModel;
    this.s = state;
    this.onLog = onLog || (() => {});
    this.onStateChange = onStateChange || (() => {});
  }

  update(deltaTime) {
    // First: see if any actions unlocked this tick
    let unlockedChanged = false;
    if (typeof this.model.checkUnlocks === "function") {
      unlockedChanged = this.model.checkUnlocks();
    }

    // If idle, still notify the view about unlock changes
    if (!this.s.currentAction) {
      if (unlockedChanged) this.onStateChange(this.s);
      return;
    }

    const action = this.model.getCurrentAction();
    if (!action) {
      if (unlockedChanged) this.onStateChange(this.s);
      return;
    }

    // Advance progress
    const result = this.model.tickProgress(action, deltaTime);
    if (result.completed) {
      this.log(this.formatActionCompleted(result.event, this.s));
      this.onStateChange(this.s);

      // After a purchase finishes, switch back to rest; otherwise resume same action
      if (this.s.defs.actions[this.s.currentAction].type === "purchase") {
        this.switchToRestAction();
      } else {
        this.startAction(this.s.currentAction);
      }
      return;
    }

    // If unlocks happened while progressing, let the view know
    if (unlockedChanged) this.onStateChange(this.s);
  }

  startAction(actionId) {
    const result = this.model.start(actionId);
    if (!result.ok) {
      if (result.reason === 'cant-afford') this.switchToRestAction();
      return false;
    }
    this.onStateChange(this.s);
    return true;
  }

  stopCurrentAction() {
    console.log("Stop action");
    const id = this.model.stop();
    if (!id) return null;
    this.log(`You paused your current action. Progress is saved.`);
    this.onStateChange(this.s);
    return id;
  }


  // — Controller-only policies —

  switchToRestAction() {
    this.s.previousAction = this.s.currentAction;
    if (this.s.defaultRestAction) {
      this.startAction(this.s.defaultRestAction);
    }
  }

  isCurrentActionRest() {
    const cur = this.s.currentAction;
    if (!cur) return false;
    const a = this.s.actions[cur];
    return !!(a && a.isRestAction);
  }

  isRestAction(id) {
    const a = this.s.actions[id];
    return !!(a && a.isRestAction);
  }

  formatActionCompleted(event, state) {
    const { actionId, rewards, timestamp } = event;
    const action = state.actions?.[actionId];
    const parts = [];

    // Start with a base message
    let actionName = action?.name || actionId;

    if (typeof actionName === 'string' || actionName instanceof String) {
      actionName = actionName.toString().replace(/_/g, ' ');
    }

    parts.push(`You completed ${actionName}.`);

    // ---- Resource rewards ----
    if (rewards?.resources && Object.keys(rewards.resources).length) {
      const resourceMsgs = Object.entries(rewards.resources).map(([id, amount]) => {
        const res = state.resources?.[id];
        const name = res?.name || id;
        return `${amount > 0 ? '+' : ''}${amount} ${name}`;
      });
      parts.push(` ${resourceMsgs.join(', ')}`);
    }

    // ---- Skill XP rewards ----
    if (rewards?.skills && Object.keys(rewards.skills).length) {
      const skillMsgs = Object.entries(rewards.skills).map(([id, xp]) => {
        const skill = state.skills?.[id];
        const name = skill?.name || id;
        return `+${xp} ${name} XP`;
      });
      parts.push(skillMsgs.join(', ') + '.');
    }

    // Future-proofing: add other reward types as needed
    // if (rewards.items) { ... }

    return parts.join(' ');
  }


  log(message) {
    this.s.actionLog.unshift({ message });
    if (this.s.actionLog.length > 100) this.s.actionLog.pop();
    this.onLog(message);
  }
}
