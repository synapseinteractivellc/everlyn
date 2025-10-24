// js/controllers/viewController.js
import ResourceView from "../views/resourceView.js";
import ActionView from "../views/actionView.js";
import SkillView from "../views/skillView.js";
import ActionLogView from "../views/actionLogView.js";
import CharacterView from "../views/characterView.js";

export default class ViewController {
  constructor(defs, state, actionController) {
    this.defs = defs;
    this.state = state;
    this.actionController = actionController;

    // instantiate sub‑views
    this.characterView = new CharacterView();
    this.resourceView = new ResourceView();
    this.actionView = new ActionView(actionController);
    this.skillView = new SkillView();
    this.ActionLogView = new ActionLogView(this.actionController);

    this.currentScreen = "main";
    this.initNav();
  }

  initNav() {
    // set up navigation buttons to switch screens
    const navButtons = document.querySelectorAll("#nav-bar .nav-button");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const screen = btn.getAttribute("data-screen");
        if (screen) {
          console.log("Screen: ", screen);
          this.showScreen(screen);
        }
      });
    });
  }

  loadGameScreen() {
    const overlay = document.getElementById('character-creation-overlay');
    const gameContainer = document.getElementById('game-container');

    overlay.style.display = 'none';
    gameContainer.style.display = '';
  }

  showScreen(screen) {
    this.currentScreen = screen;
    // update screen visibility
    document.querySelectorAll("#action-area .screen").forEach((el) => {
      el.classList.toggle("active", el.id === `screen-${screen}`);
    });
    // update nav button state
    document.querySelectorAll("#nav-bar .nav-button").forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.getAttribute("data-screen") === screen
      );
    });
    // refresh views for the new screen
    this.update(this.state, this.defs);
  }

  update(state, defs) {
    // save latest state/defs
    this.state = state;
    this.defs = defs;
    // update all subviews regardless of current screen
    this.characterView.update(state);
    this.resourceView.update(state, defs);
    this.actionView.update(state, defs);
    this.skillView.update(state, defs);
    this.ActionLogView.update(state, defs);
  }
}