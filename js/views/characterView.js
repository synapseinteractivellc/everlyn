// js/views/characterView.js
export default class CharacterView {
  constructor() {
    this.cInfo = document.getElementById('character-info');

    if (!this.cInfo) {
      console.error("[Everlyn] Missing #character-info in DOM.");
      document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red;">Missing #character-info in DOM.</pre>`
      );
    }
  }

  update(state) {
    if (!state || !this.cInfo) return;
    this.cInfo.innerHTML = `${state.character.name} the Level ${state.character.level} ${state.character.classId}`;    
  }
}