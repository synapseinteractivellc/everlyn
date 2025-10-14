// js/boot/loadContent.js

// ---------- tiny utils ----------
function indexById(arr) {
  const map = Object.create(null);
  for (const x of arr) {
    if (!map[x.id]) map[x.id] = x;
    else console.warn(`Duplicate id detected: ${x.id} (last one wins)`);
  }
  return map;
}
function deepFreeze(obj) {
  if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const v of Object.values(obj)) deepFreeze(v);
  }
  return obj;
}
const isStr = (x) => typeof x === "string" && x.length > 0;
const isNum = (x) => typeof x === "number" && Number.isFinite(x);
const isInt = (x) => Number.isInteger(x);
const nonNegInt = (x) => isInt(x) && x >= 0;
const posNum = (x) => isNum(x) && x > 0;
const arr = (x) => (Array.isArray(x) ? x : []);

// utils
const asArray = (raw) => Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? Object.values(raw) : []);

// ---------- base validators you already had ----------
function validateResources(raw, errors) {
  const out = [];
  if (!Array.isArray(raw)) { errors.push("resources.json must be an array"); return out; }

  const oneOf = (v, list) => list.includes(v);
  const toArray = (v) => Array.isArray(v) ? v : (v && typeof v === "object" ? [v] : []);

  raw.forEach((r, i) => {
    if (!r || typeof r !== "object") { errors.push(`resources[${i}] must be an object`); return; }

    // required basics
    if (!isStr(r.id))   errors.push(`resources[${i}].id missing/non-string`);
    if (!isStr(r.name)) errors.push(`resources[${i}].name missing/non-string`);
    if (r.type !== undefined && !oneOf(r.type, ["stat", "currency"])) {
      errors.push(`resources[${i}].type must be "stat" or "currency" if present`);
    }

    // numerics
    if (r.amount !== undefined && !isNum(r.amount)) {
      errors.push(`resources[${i}].amount must be a number if present`);
    }
    if (r.maximum !== undefined && !(isNum(r.maximum) && r.maximum > 0)) {
      errors.push(`resources[${i}].maximum must be a positive number if present`);
    }
    if (r.changePerTick !== undefined && !isNum(r.changePerTick)) {
      errors.push(`resources[${i}].changePerTick must be a number if present`);
    }
    if (isNum(r.amount) && isNum(r.maximum) && r.amount > r.maximum) {
      errors.push(`resources[${i}].amount cannot exceed maximum`);
    }

    // requirement array (normalized)
    const reqs = toArray(r.requirement).map((rq, j) => {
      const ok = rq && typeof rq === "object";
      const resource = ok ? rq.resource : undefined;
      const amt = ok ? rq.amt : undefined;
      if (!isStr(resource)) errors.push(`resources[${i}].requirement[${j}].resource missing/non-string`);
      if (!posNum(amt))     errors.push(`resources[${i}].requirement[${j}].amt must be a positive number`);
      return { resource, amt: Number(amt) };
    });

    // unlocked: boolean or derived from presence of requirements
    let unlocked;
    if (typeof r.unlocked === "boolean") unlocked = r.unlocked;
    else unlocked = reqs.length === 0; // default: unlocked if no requirements

    out.push({
      id: r.id,
      name: r.name,
      type: r.type ?? "currency",
      description: isStr(r.description) ? r.description : "",
      amount: isNum(r.amount) ? r.amount : 0,
      maximum: isNum(r.maximum) ? r.maximum : Number.MAX_SAFE_INTEGER,
      changePerTick: isNum(r.changePerTick) ? r.changePerTick : 0,
      unlocked,
      requirement: reqs,
      // keep any extra fields
      ...r,
    });
  });

  return out;
}

function validateSkills(raw, errors) {
  const out = [];
  if (!Array.isArray(raw)) { errors.push("skills.json must be an array"); return out; }
  raw.forEach((s, i) => {
    if (!s || typeof s !== "object") { errors.push(`skills[${i}] must be an object`); return; }
    if (!isStr(s.id))   errors.push(`skills[${i}].id missing/non-string`);
    if (!isStr(s.name)) errors.push(`skills[${i}].name missing/non-string`);
    out.push({ id: s.id, name: s.name, ...s }); // allow extra fields
  });
  return out;
}

function validateActions(raw, errors) {
  const out = [];
  if (!Array.isArray(raw)) { errors.push("actions must be an array or object-map"); return out; }

  const isStr = (x) => typeof x === "string" && x.length > 0;
  const isNum = (x) => typeof x === "number" && Number.isFinite(x);
  const nonNegInt = (x) => Number.isInteger(x) && x >= 0;
  const arr = (x) => Array.isArray(x) ? x : [];

  raw.forEach((a, i) => {
    if (!a || typeof a !== "object") { errors.push(`actions[${i}] must be an object`); return; }
    if (!isStr(a.id))   errors.push(`actions[${i}].id missing/non-string`);
    if (!isStr(a.name)) errors.push(`actions[${i}].name missing/non-string`);

    // duration: allow absent or 0 for "instant" actions
    if (a.duration !== undefined && !(isNum(a.duration) && a.duration >= 0)) {
      errors.push(`actions[${i}].duration must be >= 0 if present`);
    }
    const duration = a.duration ?? 0;

    // cost: [{ resource, amt }]
    const cost = arr(a.cost).map((c, j) => {
      const ok = c && typeof c === "object";
      const resource = ok ? c.resource : undefined;
      const amt = ok ? c.amt : undefined;
      if (!isStr(resource)) errors.push(`actions[${i}].cost[${j}].resource missing/non-string`);
      if (!nonNegInt(amt))  errors.push(`actions[${i}].cost[${j}].amt must be a non-negative integer`);
      return { resource, amt };
    });

    // reward: resource (amt|min..max|maxChange) or skill (amt)
    const reward = arr(a.reward).map((r, j) => {
      if (!r || typeof r !== "object") { errors.push(`actions[${i}].reward[${j}] must be an object`); return null; }
      if ("resource" in r) {
        const resource = r.resource;
        if (!isStr(resource)) errors.push(`actions[${i}].reward[${j}].resource missing/non-string`);
        const hasAmt = nonNegInt(r.amt ?? -1);
        const hasRange = nonNegInt(r.min ?? -1) && nonNegInt(r.max ?? -1) && r.max >= r.min;
        const hasMaxChange = isNum(r.maxChange);
        if (!hasAmt && !hasRange && !hasMaxChange) {
          errors.push(`actions[${i}].reward[${j}] must have amt or {min,max} or maxChange`);
        }
        return hasAmt
          ? { resource, amt: r.amt }
          : hasRange
            ? { resource, min: r.min, max: r.max }
            : { resource, maxChange: r.maxChange };
      }
      if ("skill" in r) {
        if (!isStr(r.skill)) errors.push(`actions[${i}].reward[${j}].skill missing/non-string`);
        if (!nonNegInt(r.amt)) errors.push(`actions[${i}].reward[${j}].amt must be a non-negative integer`);
        return { skill: r.skill, amt: r.amt };
      }
      errors.push(`actions[${i}].reward[${j}] must have 'resource' or 'skill' key`);
      return null;
    }).filter(Boolean);

    // requirement: accept skill/level, location, or resource/amt
    const requirement = arr(a.requirement).map((rq, j) => {
      if (!rq || typeof rq !== "object") { errors.push(`actions[${i}].requirement[${j}] must be an object`); return null; }
      if ("skill" in rq) {
        if (!isStr(rq.skill)) errors.push(`actions[${i}].requirement[${j}].skill missing/non-string`);
        if (!nonNegInt(rq.level ?? -1)) errors.push(`actions[${i}].requirement[${j}].level must be non-negative integer`);
        return { kind: "skill", skill: rq.skill, level: rq.level ?? 0 };
      }
      if ("location" in rq) {
        if (!isStr(rq.location)) errors.push(`actions[${i}].requirement[${j}].location missing/non-string`);
        return { kind: "location", location: rq.location };
      }
      if ("resource" in rq) {
        if (!isStr(rq.resource)) errors.push(`actions[${i}].requirement[${j}].resource missing/non-string`);
        if (!nonNegInt(rq.amt ?? -1)) errors.push(`actions[${i}].requirement[${j}].amt must be non-negative integer`);
        return { kind: "resource", resource: rq.resource, amt: rq.amt ?? 0 };
      }
      errors.push(`actions[${i}].requirement[${j}] must have skill/location/resource key`);
      return null;
    }).filter(Boolean);

    out.push({
      id: a.id,
      name: a.name,
      description: typeof a.description === "string" ? a.description : undefined,
      duration,
      cost,
      reward,
      requirement,
      unlocked: !!a.unlocked,
      isRestAction: !!a.isRestAction,
      // keep any extra fields you might have added
      ...a,
    });
  });

  return out;
}


// ---------- new validators (lightweight, shape-only) ----------
function validateClasses(raw, errors) {
  const out = [];
  if (!Array.isArray(raw)) { errors.push("classes.json must be an array"); return out; }
  raw.forEach((c, i) => {
    if (!c || typeof c !== "object") { errors.push(`classes[${i}] must be an object`); return; }
    if (!isStr(c.id))   errors.push(`classes[${i}].id missing/non-string`);
    if (!isStr(c.name)) errors.push(`classes[${i}].name missing/non-string`);
    out.push({ id: c.id, name: c.name, ...c });
  });
  return out;
}

function validateEquipment(raw, errors) {
  const out = [];
  if (!Array.isArray(raw)) { errors.push("equipment.json must be an array"); return out; }
  raw.forEach((e, i) => {
    if (!e || typeof e !== "object") { errors.push(`equipment[${i}] must be an object`); return; }
    if (!isStr(e.id))   errors.push(`equipment[${i}].id missing/non-string`);
    if (!isStr(e.name)) errors.push(`equipment[${i}].name missing/non-string`);
    // optional: slot, requirements, cost (same cost shape as actions)
    const cost = arr(e.cost).map((c, j) => {
      const ok = c && typeof c === "object";
      const resource = ok ? c.resource : undefined;
      const amt = ok ? c.amt : undefined;
      if (!isStr(resource)) errors.push(`equipment[${i}].cost[${j}].resource missing/non-string`);
      if (!nonNegInt(amt))  errors.push(`equipment[${i}].cost[${j}].amt must be non-negative integer`);
      return { resource, amt };
    });
    out.push({ id: e.id, name: e.name, cost, ...e });
  });
  return out;
}

function validateFurniture(raw, errors) {
  const out = [];
  if (!Array.isArray(raw)) { errors.push("furniture.json must be an array"); return out; }
  raw.forEach((f, i) => {
    if (!f || typeof f !== "object") { errors.push(`furniture[${i}] must be an object`); return; }
    if (!isStr(f.id))   errors.push(`furniture[${i}].id missing/non-string`);
    if (!isStr(f.name)) errors.push(`furniture[${i}].name missing/non-string`);
    out.push({ id: f.id, name: f.name, ...f });
  });
  return out;
}

function validateHomes(raw, errors) {
  const out = [];
  if (!Array.isArray(raw)) { errors.push("homes.json must be an array"); return out; }
  raw.forEach((h, i) => {
    if (!h || typeof h !== "object") { errors.push(`homes[${i}] must be an object`); return; }
    if (!isStr(h.id))   errors.push(`homes[${i}].id missing/non-string`);
    if (!isStr(h.name)) errors.push(`homes[${i}].name missing/non-string`);
    // optional: locationId, furniture slots, etc.
    out.push({ id: h.id, name: h.name, ...h });
  });
  return out;
}

function validateLocations(raw, errors) {
  const out = [];
  if (!Array.isArray(raw)) { errors.push("locations.json must be an array"); return out; }
  raw.forEach((l, i) => {
    if (!l || typeof l !== "object") { errors.push(`locations[${i}] must be an object`); return; }
    if (!isStr(l.id))   errors.push(`locations[${i}].id missing/non-string`);
    if (!isStr(l.name)) errors.push(`locations[${i}].name missing/non-string`);
    out.push({ id: l.id, name: l.name, unlocked: !!l.unlocked, ...l });
  });
  return out;
}

// ---------- main loader ----------
export async function loadContent() {
  // 1) fetch (paths are relative to index.html)
  const [
    resourcesRaw, skillsRaw, actionsRaw,
    classesRaw, equipmentRaw, furnitureRaw, homesRaw, locationsRaw
  ] = await Promise.all([
    fetch("data/resources.json").then(r => r.json()),
    fetch("data/skills.json").then(r => r.json()),
    fetch("data/actions.json").then(r => r.json()),
    fetch("data/classes.json").then(r => r.json()),
    fetch("data/equipment.json").then(r => r.json()),
    fetch("data/furniture.json").then(r => r.json()),
    fetch("data/homes.json").then(r => r.json()),
    fetch("data/locations.json").then(r => r.json()),
  ]);

  // turn object-maps into arrays if needed
  const resourcesInput  = asArray(resourcesRaw);
  const skillsInput     = asArray(skillsRaw);
  const actionsInput    = asArray(actionsRaw);
  const classesInput    = asArray(classesRaw);
  const equipmentInput  = asArray(equipmentRaw);
  const furnitureInput  = asArray(furnitureRaw);
  const homesInput      = asArray(homesRaw);
  const locationsInput  = asArray(locationsRaw);

  // 3) validate (do NOT reuse the same const name)
  const errors = [];
  const resourcesValidated = validateResources(resourcesInput, errors);
  const skillsValidated    = validateSkills(skillsInput, errors);
  const actionsValidated   = validateActions(actionsInput, errors);
  const classesValidated   = validateClasses(classesInput, errors);
  const equipmentValidated = validateEquipment(equipmentInput, errors);
  const furnitureValidated = validateFurniture(furnitureInput, errors);
  const homesValidated     = validateHomes(homesInput, errors);
  const locationsValidated = validateLocations(locationsInput, errors);

  // 4) index (final maps)
  const indexById = (arr) => Object.fromEntries(arr.map(x => [x.id, x]));

  const resources = indexById(resourcesValidated);
  const skills    = indexById(skillsValidated);
  const actions   = indexById(actionsValidated);
  const classes   = indexById(classesValidated);
  const equipment = indexById(equipmentValidated);
  const furniture = indexById(furnitureValidated);
  const homes     = indexById(homesValidated);
  const locations = indexById(locationsValidated);

  // 5) cross-reference checks (light, only if fields exist)
  for (const a of actionsValidated) {
    for (const c of a.cost) {
      if (!resources[c.resource]) errors.push(`action:${a.id} cost references unknown resource:${c.resource}`);
    }
    for (const r of a.reward) {
      if ("resource" in r && !resources[r.resource]) errors.push(`action:${a.id} reward references unknown resource:${r.resource}`);
      if ("skill" in r && !skills[r.skill])         errors.push(`action:${a.id} reward references unknown skill:${r.skill}`);
    }
    // comment for the moment
    // for (const rq of a.requirement) {
    //  if (!skills[rq.skill]) errors.push(`action:${a.id} requirement references unknown skill:${rq.skill}`);
    // }
    // optional: action.locationId → locations check (if you add it)
    if (a.locationId && !locations[a.locationId]) errors.push(`action:${a.id} unknown locationId:${a.locationId}`);
  }

  for (const e of equipmentValidated) {
    for (const c of arr(e.cost)) {
      if (c.resource && !resources[c.resource]) errors.push(`equipment:${e.id} cost unknown resource:${c.resource}`);
    }
    if (e.requirements) {
      // e.g. { skill:'survival', level:1 }
      const rq = e.requirements;
      if (rq.skill && !skills[rq.skill]) errors.push(`equipment:${e.id} requirement unknown skill:${rq.skill}`);
    }
  }

  for (const h of homesValidated) {
    if (h.locationId && !locations[h.locationId]) errors.push(`home:${h.id} unknown locationId:${h.locationId}`);
    for (const fId of arr(h.defaultFurnitureIds)) {
      if (!furniture[fId]) errors.push(`home:${h.id} unknown furniture id:${fId}`);
    }
  }

  for (const a of actionsValidated) {
    for (const c of a.cost) {
      if (c.resource && !resources[c.resource]) errors.push(`action:${a.id} cost unknown resource:${c.resource}`);
    }
    for (const r of a.reward) {
      if (r.resource && !resources[r.resource]) errors.push(`action:${a.id} reward unknown resource:${r.resource}`);
      if (r.skill && !skills[r.skill])         errors.push(`action:${a.id} reward unknown skill:${r.skill}`);
    }
    for (const rq of a.requirement) {
      if (rq.kind === "skill" && !skills[rq.skill])       errors.push(`action:${a.id} req unknown skill:${rq.skill}`);
      if (rq.kind === "location" && !locations[rq.location]) errors.push(`action:${a.id} req unknown location:${rq.location}`);
      if (rq.kind === "resource" && !resources[rq.resource]) errors.push(`action:${a.id} req unknown resource:${rq.resource}`);
    }
  }

  // Resources can depend on other resources (requirements)
  for (const r of resourcesValidated) {
    for (const rq of (r.requirements || [])) {
      if (rq.resource && !resources[rq.resource]) {
        errors.push(`resource:${r.id} requirement references unknown resource:${rq.resource}`);
      }
      if (!(typeof rq.amt === "number") || rq.amt < 0) {
        errors.push(`resource:${r.id} requirement for ${rq.resource} has invalid amt (must be >= 0)`);
      }
    }
  }


  // 6) fail fast if anything’s wrong
  if (errors.length) {
    throw new Error(["Content validation failed:", ...errors.map(e => ` - ${e}`)].join("\n"));
  }

  // 7) freeze + return
  return deepFreeze({
    resources, skills, actions,
    classes, equipment, furniture, homes, locations,
    version: "v1",
  });
}
