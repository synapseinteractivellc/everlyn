// js/model/actionModel.js
export class ActionModel {
  constructor(state, { rng = Math.random, now = () => Date.now(), resourceModel, skillModel } = {}) {
    this.s = state;
    this.rng = rng;
    this.now = now;
    this.resources = resourceModel;
    this.skills = skillModel;
  }

  getCurrentAction() {
    const id = this.s.currentAction;
    return id ? this.s.actions[id] : null;
  }

  canAfford(actionId) {
    const a = this.s.actions[actionId];
    if (!a) return { ok:false, reason:'missing' };
    for (const { resource, amt } of (a.cost || [])) {
      const r = this.s.resources[resource];
      if (!r || (r.amount ?? 0) < (amt ?? 0)) {
        return { ok:false, reason:'insufficient', lacking:{ resource, amt } };
      }
    }
    return { ok:true };
  }

  start(actionId) {
    console.log("Action fired:", actionId);
    const action = this.s.actions[actionId];
    if (!action || !action.unlocked) return { ok: false, reason: 'locked' };

    if (!this.canAfford(action) && !action.isRestAction) {
      return { ok: false, reason: 'cant-afford' };
    }

    this.s.currentAction = actionId;
    action.lastActionStartTime = this.now();
    // Don’t touch UI here—return a message for controller/view
    const resumed = action.currentProgress > 0;
    return {
      ok: true,
      message: resumed
        ? `You resumed ${action.name} at ${Math.floor(action.currentProgress * 100)}%.`
        : `You started ${action.name}.`,
    };
  }

  tickProgress(action, deltaTime) {
    // authoritative progress math lives in the Model
    action.currentProgress += deltaTime / action.baseDuration;
    if (action.currentProgress >= 1) {
      return this.complete(action);
    }
    return { completed: false };
  }

  applyCosts(action) {
    const entries = Array.isArray(action.cost) ? action.cost : [];
    const results = [];
    for (const e of entries) {
      if (e.resource) {
        const r = this.resources.spend(e.resource, e.amt ?? 0);
        results.push({ kind:'resource', id:e.resource, ...r });
        if (!r.ok) return { ok:false, results }; // fail-fast on insufficient
      }
    }
    return { ok:true, results };
  }

  // Expect an injected RNG: this.rng() -> [0,1)
  // and state like: this.s.resources, this.s.skills
  applyRewards(action) {
    const entries = Array.isArray(action.reward) ? action.reward : [];
    const deltas = { resources:{}, skills:{} };

    for (const e of entries) {
      if (e.resource) {
        const min = Number.isFinite(e.min) ? e.min : (e.amt ?? 0);
        const max = Number.isFinite(e.max) ? e.max : min;
        const roll = Math.floor((this.rng() ?? Math.random()) * (max - min + 1)) + min;
        const res = this.resources.grant(e.resource, roll);
        if (res.ok && res.applied) deltas.resources[e.resource] = (deltas.resources[e.resource] ?? 0) + res.applied;
        continue;
      }
      if (e.skill) {
        const xp = e.amt ?? 0;
        const res = this.skills.addXP(e.skill, xp);
        if (res.ok && res.applied) deltas.skills[e.skill] = (deltas.skills[e.skill] ?? 0) + res.applied;
        continue;
      }
    }
    return { ok:true, deltas };
  }


  complete(action) {
    const costs = this.applyCosts(action);
    if (!costs.ok) return { completed:false, event:{ type:'ActionCostFailed', results:costs.results } };

    const rewards = this.applyRewards(action);

    // bookkeeping that is local to the action instance
    action.completionCount = (action.completionCount || 0) + 1;
    action.currentProgress = 0;
    action.lastActionStartTime = this.now();

    // improvements can stay here, but DO NOT mutate shared definitions
    // use multipliers stored on instance, or derive at payout time

    return {
      completed: true,
      event: {
        type: 'ActionCompleted',
        actionId: action.id,
        rewards: rewards.deltas,
        timestamp: this.now()
      }
    };
  }

  stop() {
    const id = this.s.currentAction;
    if (!id) return null;
    const action = this.s.actions[id];
    if (action) action.lastActionStartTime = null;
    this.s.previousAction = this.s.currentAction;
    this.s.currentAction = null;
    return id;
  }
}
