// js/views/skillView.js
export default class SkillView {
  constructor() {
    this.skillsContainer = document.getElementById("skills-container");
    if (!this.skillsContainer) {
      console.error("[Everlyn] Missing #skills-container in DOM.");
      document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #skills-container in DOM.</pre>`
      );
    }
  }

  update(state, defs) {
    if (!state || !defs || !this.skillsContainer) return;

    const skills = state.skills ? Object.values(state.skills) : [];
    const unlocked = skills.filter((s) => s.unlocked === true);

    this.skillsContainer.innerHTML = `
      <ul>
        ${unlocked
          .map(
            (s) =>
              `<li>${defs.skills?.[s.id]?.name ?? s.id}: Level ${s.level} – XP ${s.experience}/${s.nextLevelExperience}</li>`
          )
          .join("")}
      </ul>`;
  }
}