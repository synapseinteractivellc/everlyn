// models/skillModel.js
export class SkillModel {
  constructor(state) { this.s = state; }
  addXP(id, xp) {
    const sk = this.s.skills[id];
    if (!sk) return { ok:false, reason:'missing-skill' };
    sk.experience = (sk.experience ?? 0) + xp;
    // handle level-ups here
    if (this.checkMaxLevel(id)) this.levelUp(id);
    // cap XP if at Max Level
    if (this.checkMaxLevel(id)) {
      if (sk.experience > sk.nextLevelExperience) sk.experience = sk.nextLevelExperience;
    }
    
    return { ok:true, applied: xp };
  }

  levelUp(id) {
    const sk = this.s.skills[id];
    if(!sk) return { ok:false, reason:'missing-skill' };
    if (this.checkMaxLevel(id)) return { ok:false, reason:'max-level' };

    if (sk.experience >= sk.nextLevelExperience) { 
      sk.experience -= sk.nextLevelExperience;
      sk.level++;
      sk.nextLevelExperience = sk.nextLevelExperience * Math.pow(1.1, sk.tier);
      return { ok:true, applied: level };
    } else {
      return { ok:false, reason:'not-enough-xp'};
    }
  }

  checkMaxLevel(id) {
    const sk = this.s.skills[id];
    if (sk.level >= this.s.defs.skills.id.maxLevel) return true;
    return false;
  }
}