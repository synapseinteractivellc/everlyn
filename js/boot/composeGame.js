// js/boot/composeGame.js
import { loadContent } from './loadContent.js';
import { createInitialState } from '../stateFactory.js';
import { ActionModel } from '../models/actionModel.js';
import { ResourceModel } from '../models/resourceModel.js';
import { SkillModel } from '../models/skillModel.js';
import { ActionController } from '../controllers/actionController.js';

export async function composeGame({ onLog, onStateChange, onSwitchAction }) {
  const defs = await loadContent();
  const state = createInitialState(defs);

  const resourceModel = new ResourceModel(state);
  const skillModel    = new SkillModel(state);
  const actionModel   = new ActionModel(state, {
    resourceModel,
    skillModel,
    now: () => Date.now(),
    rng: Math.random,
    defs, // pass defs if your model needs read-only access to durations etc.
  });

  const actionController = new ActionController(state, actionModel, {
    onLog,
    onStateChange,
    onSwitchAction,
  });

  return { defs, state, actionModel, actionController };
}
