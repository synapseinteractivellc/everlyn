// models/skillModel.js
export class SkillModel {
  constructor(state) { this.s = state; }
  addXP(id, xp) {
    const sk = this.s.skills[id];
    if (!sk) return { ok:false, reason:'missing-skill' };
    sk.experience = (sk.experience ?? 0) + xp;
    // handle level-ups here
    if (!this.checkMaxLevel(sk)) this.levelUp(sk);
    // cap XP if at Max Level
    if (this.checkMaxLevel(sk)) {
      if (sk.experience > sk.nextLevelExperience) sk.experience = sk.nextLevelExperience;
    }

    return { ok:true, applied: xp };
  }

  levelUp(sk) {
    if(!sk) return { ok:false, reason:'missing-skill' };
    if (this.checkMaxLevel(sk)) return { ok:false, reason:'max-level' };

    if (sk.experience >= sk.nextLevelExperience) { 
      sk.experience -= sk.nextLevelExperience;
      sk.level++;
      sk.nextLevelExperience = Math.ceil(sk.nextLevelExperience * Math.pow(1.1, (this.s.defs.skills[sk.id].tier + 1)));
      return { ok:true, applied: "level" };
    } else {
      return { ok:false, reason:'not-enough-xp'};
    }
  }

  checkMaxLevel(sk) {
    if (sk.level >= this.s.defs.skills[sk.id].maxLevel) return true;
    return false;
  }
}