// js/createCharacter.js
import { CharacterModel } from './models/characterModel.js';

export function setupCharacterCreation(state, viewController) {
  const charModel = new CharacterModel(state);
  const overlay = document.getElementById('character-creation-overlay');
  const gameContainer = document.getElementById('game-container');
  const form = document.getElementById('character-form');
  const nameInput = document.getElementById('character-name');
  const classButtons = document.querySelectorAll('.class-choice');
  const vC = viewController;
  let selectedClass = 'Waif'; // default

  // highlight selected class
  classButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      classButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedClass = btn.dataset.class;
    });
  });

  // validate name: 2–20 alphanumeric/spaces
  function isValidName(name) {
    return /^[A-Za-z0-9 ]{2,20}$/.test(name);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!isValidName(name)) {
      alert('Name must be 2–20 characters and contain only letters, numbers or spaces.');
      return;
    }
    // set character in state
    charModel.setCharacter(name, selectedClass);
    // update header
    const info = document.getElementById('character-info');
    info.textContent = `${name} the Level ${state.character.level} ${selectedClass}`;
    // hide overlay / show game
    vC.loadGameScreen();
  });

  // show overlay initially if no name yet
  if (!state.character || !state.character.name) {
    overlay.style.display = '';
    gameContainer.style.display = 'none';
  } else {
    overlay.style.display = 'none';
    gameContainer.style.display = '';
  }
}
