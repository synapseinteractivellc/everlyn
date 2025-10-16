// js/views/skillView.js
const skills = state.skills ? Object.values(state.skills) : [];
let unlockedSkills = skills.filter(s => s.unlocked === true);

let skillsContainer = null;
skillsContainer = document.getElementById("skills-container");

if (!skillsContainer) {
    console.error(
        "[Everlyn] Missing #skillsContainer. Is the deployed HTML the one you expect?"
    );
    // Show a friendly message so the page doesn't look dead.
    document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #skillsContainer in DOM.</pre>`
    );
    return; // bail early; no container to render into
}

skillsContainer.innerHTML = `
    <ul>${unlockedSkills
      .map(
        (s) =>
          `<li>${defs.skills?.[s.id]?.name ?? s.id}: Level - ${s.level} - XP - ${s.experience}/${s.nextLevelExperience}</li>`
      )
      .join("")}</ul>
`;
