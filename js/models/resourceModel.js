// models/resourceModel.js
export class ResourceModel {
  constructor(state) { this.s = state; }
  grant(id, amount) {
    const r = this.s.resources[id];
    if (!r) return { ok:false, reason:'missing-resource' };
    const before = r.amount ?? 0;
    const cap = r.maximum ?? Infinity;
    r.amount = Math.min(before + amount, cap);
    return { ok:true, applied: r.amount - before };
  }
  spend(id, amount) {
    const r = this.s.resources[id];
    if (!r || (r.amount ?? 0) < amount) return { ok:false, reason:'insufficient' };
    r.amount -= amount;
    return { ok:true, applied: -amount };
  }

  maxChange(id, amount) {
    const r = this.s.resources[id];
    r.maximum += amount;
    return { ok:true, applied: r.amount };
  }

  /**
   * Returns true if ALL requirements on the resource definition are satisfied.
   * Supports:
   *   - { "resource": "<id>", "amt": N }
   *   - { "skill": "<id>", "level": N }
   *   - { "location": "<id>" }   // requires discovered == true
   *   - { "class": "<id>" }
   */
  canUnlock(resourceId) {
    const resourceState = this.s.resources?.[resourceId];
    const defResource = this.s.defs?.resources?.[resourceId];
    if (!resourceState || !defResource) return false;
    if (resourceState.unlocked) return false;

    const reqs = Array.isArray(defResource.requirement) ? defResource.requirement : [];

    for (const rq of reqs) {
      if (!rq || typeof rq !== "object") continue;

      // Resource requirement
      if ("resource" in rq) {
        const res = this.s.resources?.[rq.resource];
        const amt = rq.amt ?? 0;
        if (!res || (res.amount ?? 0) < amt) return false;
        continue;
      }

      // Skill-level requirement
      if ("skill" in rq) {
        const sk = this.s.skills?.[rq.skill];
        const lvl = rq.level ?? 0;
        if (!sk || (sk.level ?? 0) < lvl) return false;
        continue;
      }

      // Location requirement (must be discovered)
      if ("location" in rq) {
        const loc = this.s.locations?.[rq.location];
        if (!loc || !loc.discovered) return false;
        continue;
      }

      // Class requirement
      if ("class" in rq) {
        const classId = this.s.character?.classId;
        if (!classId || classId !== rq.class) return false;
        continue;
      }

      // Unknown requirement type: be conservative
      return false;
    }

    return true;
  }

  /**
   * Iterate over all actions and unlock any that now meet their requirements.
   * Returns true if at least one action changed from locked -> unlocked.
   */
  checkUnlocks() {
    let changed = false;
    const defs = this.s.defs?.resources;
    if (!defs) return false;
    for (const id of Object.keys(defs)) {
      const rState = this.s.resources?.[id];
      if (!rState || rState.unlocked) continue;
      if (this.canUnlock(id)) {
        rState.unlocked = true;        
        console.log(rState, " unlocked");
        changed = true;
      }
    }
    return changed;
  }
}