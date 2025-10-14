// models/skillModel.js
export class SkillModel {
  constructor(state) { this.s = state; }
  addXP(id, xp) {
    const sk = this.s.skills[id];
    if (!sk) return { ok:false, reason:'missing-skill' };
    sk.experience = (sk.experience ?? 0) + xp;
    // optional: handle level-ups here
    return { ok:true, applied: xp };
  }
}