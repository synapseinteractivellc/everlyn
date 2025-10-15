// js/controller/actionController.js
import { ActionModel } from '../models/actionModel.js';

export class ActionController {
  constructor(state, { onLog, onStateChange, onSwitchAction } = {}) {
    this.model = new ActionModel(state);
    this.s = state;
    this.onLog = onLog || (() => {});
    this.onStateChange = onStateChange || (() => {});
    this.onSwitchAction = onSwitchAction || (() => {});
  }

  update(deltaTime) {
    // if nothing to do, consider checking rest policy
    if (!this.s.currentAction) return;

    const action = this.model.getCurrentAction();
    if (!action) return;

    // If can’t afford and not rest → switch policy belongs to controller
    if (!this.model.canAfford(action) && !action.isRestAction) {
      this.switchToRestAction();
      return;
    }

    // Let Model run the rules
    const result = this.model.tickProgress(action, deltaTime);
    if (result.completed) {
      console.log("Action complete:", actionId);
      this.log(this.formatActionCompleted(result.event, this.s));
      this.onStateChange(this.s); // After completion, controller can decide to stay on same action 
      // or apply policies like “auto-rest if exhausted” 
      this.checkRestAction();
    }
  }

  startAction(actionId) {
    console.log("Action fired:", actionId);
    const result = this.model.start(actionId);
    if (!result.ok) {
      if (result.reason === 'cant-afford') this.switchToRestAction();
      return false;
    }
    this.log(result.message);
    this.onSwitchAction(actionId);
    this.onStateChange(this.s);
    return true;
  }

  stopCurrentAction() {
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

  checkRestAction() {
    if (!this.isCurrentActionRest()) return;
    if (this.areStatPoolsFull()) {
      const prev = this.s.previousAction;
      if (prev) this.startAction(prev);
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

  areStatPoolsFull() {
    for (const pool of Object.values(this.s.statPools || {})) {
      if (pool.current < pool.max) return false;
    }
    return true;
  }

  formatActionCompleted(event, state) {
    const { actionId, rewards, timestamp } = event;
    const action = state.actions?.[actionId];
    const parts = [];

    // Start with a base message
    const actionName = action?.name || actionId;
    parts.push(`You completed ${actionName}.`);

    // ---- Resource rewards ----
    if (rewards?.resources && Object.keys(rewards.resources).length) {
      const resourceMsgs = Object.entries(rewards.resources).map(([id, amount]) => {
        const res = state.resources?.[id];
        const name = res?.name || id;
        return `${amount > 0 ? '+' : ''}${amount} ${name}`;
      });
      parts.push(`Received ${resourceMsgs.join(', ')}.`);
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

    // Optional timestamp formatting
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    parts.push(`[${time}]`);

    return parts.join(' ');
  }


  log(message) {
    this.s.actionLog.unshift({ message, timestamp: Date.now() });
    if (this.s.actionLog.length > 100) this.s.actionLog.pop();
    this.onLog(message);
  }
}
