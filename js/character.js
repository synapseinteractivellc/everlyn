// character.js
class Character {
    constructor(name) {
        this.name = name;
        this.level = 1;
        this.experience = 0;
        this.skills = [];
        this.inventory = [];
    }

    // Get experience needed for next level
    getNextLevelExp() {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    // Add experience and handle leveling
    gainExperience(amount) {
        this.experience += amount;
        const nextLevelExp = this.getNextLevelExp();
        
        if (this.experience >= nextLevelExp) {
            this.levelUp();
            return true;
        }
        return false;
    }

    // Handle level up
    levelUp() {
        this.level += 1;
        this.experience = 0;
        // Could add stat increases or other bonuses here
    }

    // Save character data
    save() {
        localStorage.setItem('character', JSON.stringify(this));
    }

    // Static method to load character data
    static load() {
        const savedData = localStorage.getItem('character');
        if (!savedData) return null;
        
        const parsed = JSON.parse(savedData);
        const character = new Character(parsed.name);
        Object.assign(character, parsed);
        return character;
    }
}

export default Character;