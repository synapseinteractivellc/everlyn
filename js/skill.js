/*
 * skill.js
 *
 * Provides a simple API for loading skill definitions from a JSON
 * file, leveling those skills and applying bonuses to characters
 * based on those skills.
 */

// Load skills from the data file.  Returns a promise that resolves
// to an object keyed by skill ID.
function loadSkills() {
  return fetch('data/skill.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load skill definitions');
      }
      return response.json();
    })
    .then((data) => {
      // Normalize unlocked values: if provided as strings in JSON, convert to boolean
      Object.keys(data).forEach((id) => {
        const skill = data[id];
        if (typeof skill.unlocked === 'string') {
          skill.unlocked = skill.unlocked === 'true';
        }
      });
      return data;
    })
    .catch((err) => {
      console.error(err);
      return {};
    });
}

// Increase skill XP
function skillXPChange(state, skill, amt, updateUI) {
    // We want to see progress bars for each skill to the next level. 
    // XP is awarded for various actions. We will have a study option for each skill later on.
}

// Skill level up
function skillLevelUp(state, skill, updateUI) {
    // If the skill reaches the next level all the structure to handle that change. 
    // This would include increasing skill level. Increasing XPtoNextLevel based on 
    // XPMultiplier and some formula. 
}



// Expose functions to the global scope so they can be used in main.js
window.Actions = {
  loadSkills,
  skillXPChange,
  skillLevelUp,
};