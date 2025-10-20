// js/main.js
import { composeGame } from "./boot/composeGame.js";
import ViewController from "./controllers/viewController.js";
import { setupCharacterCreation } from "./createCharacter.js";

let viewController = null;

window.addEventListener("DOMContentLoaded", async () => {
  try {
    // compose the game and hook into state changes
    const { defs, state, actionController } = await composeGame({
      onLog: (msg) => console.log(msg),
      onStateChange: (s) => {
        if (viewController) {
          viewController.update(s, defs);
        }
      },
    });

    // expose game for debugging
    window.Game = { defs, state, actionController };

    // instantiate our view controller
    viewController = new ViewController(defs, state, actionController);
    // initial render
    viewController.update(state, defs);

    // start the game loop
    let lastTick = performance.now();
    function loop(now) {
      const delta = now - lastTick;
      lastTick = now;
      actionController.update(delta);
      viewController.update(state, defs);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // initialize character creation overlay
    setupCharacterCreation(state);
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<pre style="color:red;">Failed to load game:\n${err.message}</pre>`;
  }
});