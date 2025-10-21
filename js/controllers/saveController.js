// js/controllers/saveController.js
import { createInitialState } from '../stateFactory.js';

// deep merge helper; merges nested objects so new props aren’t lost
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    console.log("Deep merge try", key);
    const srcVal = source[key];
    const tgtVal = target[key];
    if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      if (!tgtVal) target[key] = {};
      deepMerge(target[key], srcVal);
    } else {
      target[key] = srcVal;
    }
  }
}

export default class SaveController {
  constructor(state, defs) {
    this.state = state;
    this.defs = defs;
    this.saveKey = 'everlyn-save';
    this.version = 0.1;
    this.autoSaveInterval = null;
  }

  // Serialise dynamic state to localStorage
  save() {
    const saveObj = {
      version: this.version,
      timestamp: Date.now(),
      state: JSON.parse(
        JSON.stringify(this.state, (k, v) => (k === 'defs' ? undefined : v))
      ),
    };
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(saveObj));
      console.log('Game saved.');
    } catch (err) {
      console.error('Failed to save game:', err);
    }
  }

  // Load from localStorage and merge with a fresh state
  load() {
    const raw = localStorage.getItem(this.saveKey);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      const savedState = parsed.state || parsed;
      console.log("Saved State: ", savedState);
      console.log("State from try: ", this.state);
      const fresh = createInitialState(this.defs);      
      console.log("Fresh from try: ", fresh);
      deepMerge(fresh, savedState);
      deepMerge(this.state, fresh); // update existing references
      console.log('Game loaded.');
      return true;
    } catch (err) {
      console.log("State from err: ", this.state);
      console.error('Failed to load save:', err);
      return false;
    }
  }

  // Autosave every 30 seconds
  startAutoSave(intervalMs = 30000) {
    this.autoSaveInterval = setInterval(() => this.save(), intervalMs);
  }

  // Cancel autosave (if needed)
  stopAutoSave() {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
  }

  // Prompt and wipe save with delay
  wipe() {
    const c = this.state.character || {};
    const className =
      (this.defs.classes?.[c.classId]?.name ?? c.classId) || 'Waif';
    const level = c.level ?? 1;
    const name = c.name || 'Unnamed';
    const msg = `Are you certain you want to kill ${name} your Level ${level} ${className}?? There's no going back if you click yes.`;
    if (!confirm(msg)) return;
    // small delay before reload to let player reconsider
    setTimeout(() => {
      localStorage.removeItem(this.saveKey);
      location.reload();
    }, 3000);
  }

  // Attach click handlers to save/wipe buttons
  attachButtons() {
    const saveBtn = document.getElementById('save-button');
    const wipeBtn = document.getElementById('wipe-button');
    if (saveBtn) saveBtn.addEventListener('click', () => this.save());
    if (wipeBtn) wipeBtn.addEventListener('click', () => this.wipe());
  }
}
