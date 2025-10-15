// js/stateFactory.js

export function createInitialState(defs) {
  const resources = Object.fromEntries(
    Object.keys(defs.resources).map(id => [
      id,
      {
        id,
        amount: defs.resources[id].amount,
        maximum: defs.resources[id].maximum ?? Infinity,
        changePerTick: defs.resources[id].changePerTick,
        unlocked: !!defs.resources[id].unlocked
      },
    ])
  );

  const skills = Object.fromEntries(
    Object.keys(defs.skills).map(id => [
      id,
      {
        id,
        level: 0,
        experience: 0,
        nextLevelExperience: defs.skills[id].nextLevelExperience,
        unlocked: !!defs.skills[id].unlocked, // initial unlock state from defs
      },
    ])
  );

  const actions = Object.fromEntries(
    Object.keys(defs.actions).map(id => [
      id,
      {
        id,
        currentProgress: 0,
        completionCount: 0,
        lastActionStartTime: null,
        unlocked: !!defs.actions[id].unlocked, // initial unlock state from defs
      },
    ])
  );

  // --- New content types ---

  const classes = Object.fromEntries(
    Object.keys(defs.classes).map(id => [
      id,
      {
        id,
        unlocked: !!defs.classes[id].unlocked,
        selected: false, // player’s chosen class
      },
    ])
  );

  const equipment = Object.fromEntries(
    Object.keys(defs.equipment).map(id => [
      id,
      {
        id,
        owned: 0, // count or boolean
        equipped: false,
        durability: defs.equipment[id].durability ?? null,
      },
    ])
  );

  const furniture = Object.fromEntries(
    Object.keys(defs.furniture).map(id => [
      id,
      {
        id,
        owned: 0,
        placed: false,
      },
    ])
  );

  const homes = Object.fromEntries(
    Object.keys(defs.homes).map(id => [
      id,
      {
        id,
        owned: !!defs.homes[id].defaultOwned,
        upgraded: false,
        currentFurniture: [],
      },
    ])
  );

  const locations = Object.fromEntries(
    Object.keys(defs.locations).map(id => [
      id,
      {
        id,
        unlocked: !!defs.locations[id].unlocked,
        visited: false,
      },
    ])
  );

  return {
    defs, // frozen static content reference
    resources,
    skills,
    actions,
    classes,
    equipment,
    furniture,
    homes,
    locations,
    currentAction: null,
    previousAction: null,
    defaultRestAction: null,
    actionLog: [],
  };
}
