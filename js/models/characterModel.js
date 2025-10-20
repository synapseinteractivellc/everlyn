// js/models/characterModel.js
export class CharacterModel {
  constructor(state) {
    this.s = state;
  }
  setCharacter(name, classId) {
    this.s.character.name = name;
    this.s.character.classId = classId;
  }
  addXP(amount) {
    const c = this.s.character;
    c.xp += amount;
    while (c.xp >= c.xpToNext) {
      c.xp -= c.xpToNext;
      c.level++;
      c.xpToNext = Math.ceil(c.xpToNext * 1.1);
    }
  }
}