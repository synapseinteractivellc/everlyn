// character.js
class Character {
    constructor(name) {
        this.name = name;
        this.level = 1;
        this.experience = 0;
        this.resources = {
            gold: {
            current: 0,
            max: 10,
            unlocked: true
            },
            research: {
            current: 0,
            max: 10,
            unlocked: false
            },
            arcana: {
            current: 0,
            max: 0,
            unlocked: false
            },
            scrolls: {
            current: 0,
            max: 10,
            unlocked: false
            },
            codices: {
            current: 0,
            max: 0,
            unlocked: false
            },
            tomes: {
            current: 0,
            max: 0,
            unlocked: false
            },
            gemstones: {
            current: 0,
            max: 0,
            unlocked: false
            },
            waterGems: {
            current: 0,
            max: 0,
            unlocked: false
            },
            earthGems: {
            current: 0,
            max: 0,
            unlocked: false
            },
            fireGems: {
            current: 0,
            max: 0,
            unlocked: false
            },
            airGems: {
            current: 0,
            max: 0,
            unlocked: false
            },
            lightGems: {
            current: 0,
            max: 0,
            unlocked: false
            },
            shadowGems: {
            current: 0,
            max: 0,
            unlocked: false
            },
            waterRunes: {
            current: 0,
            max: 0,
            unlocked: false
            },
            earthRunes: {
            current: 0,
            max: 0,
            unlocked: false
            },
            fireRunes: {
            current: 0,
            max: 0,
            unlocked: false
            },
            airRunes: {
            current: 0,
            max: 0,
            unlocked: false
            },
            herbs: {
            current: 0,
            max: 0,
            unlocked: false
            },
            cloth: {
            current: 0,
            max: 0,
            unlocked: false
            },
            skins: {
            current: 0,
            max: 0,
            unlocked: false
            },
            leather: {
            current: 0,
            max: 0,
            unlocked: false
            },
            wood: {
            current: 0,
            max: 0,
            unlocked: false
            },
            stone: {
            current: 0,
            max: 0,
            unlocked: false
            },
            copper: {
            current: 0,
            max: 0,
            unlocked: false
            },
            bronze: {
            current: 0,
            max: 0,
            unlocked: false
            },
            iron: {
            current: 0,
            max: 0,
            unlocked: false
            },
            steel: {
            current: 0,
            max: 0,
            unlocked: false
            },
            quicksilver: {
            current: 0,
            max: 0,
            unlocked: false
            },
            mithral: {
            current: 0,
            max: 0,
            unlocked: false
            },
            admantine: {
            current: 0,
            max: 0,
            unlocked: false
            },
        };
        this.stats = {
            health: {
            current: 10,
            max: 10,
            unlocked: true
            },
            stamina: {
            current: 10,
            max: 10,
            unlocked: true
            },
            mana: {
            current: 0,
            max: 0,
            unlocked: false
            },
            waterMana: {
            current: 0,
            max: 0,
            unlocked: false
            },
            earthMana: {
            current: 0,
            max: 0,
            unlocked: false
            },
            fireMana: {
            current: 0,
            max: 0,
            unlocked: false
            },
            airMana: {
            current: 0,
            max: 0,
            unlocked: false
            },
            lightMana: {
            current: 0,
            max: 0,
            unlocked: false
            },
            shadowMana: {
            current: 0,
            max: 0,
            unlocked: false
            },
            rage: {
            current: 0,
            max: 0,
            unlocked: false
            },
        };
        this.actions = {
        };
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