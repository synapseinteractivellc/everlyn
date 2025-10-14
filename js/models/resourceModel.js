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
}