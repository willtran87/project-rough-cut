/** Load-time contracts for this chapter's authored encounters and controls. */

/** @typedef {{x:number,y:number}} CoursePoint */
/**
 * @typedef {Object} CrossingDefinition
 * @property {string} id Stable report identity; never selects behavior.
 * @property {string} water Channel whose phase describes arrival.
 * @property {string[]} channels All channels counted by this encounter.
 * @property {'x'|'y'} axis Longitudinal travel axis.
 * @property {-1|1} direction Forward travel along that axis.
 * @property {number} entry
 * @property {number} exit
 * @property {number} center Lateral corridor coordinate.
 * @property {-1|1} drySide
 * @property {number} dryX Minimum lateral distance defining the dry branch.
 * @property {number} lateralReach Encounter's lateral observation envelope.
 * @property {string} [parent] Aggregate encounter containing this crossing.
 * @property {boolean} [requiresBypass]
 * @property {number} [minLateral] Exclusive approach bound.
 * @property {number} [maxLateral] Exclusive approach bound.
 */
/**
 * @typedef {Object} InteractionDefinition
 * @property {'bypass'|'note'|'gate'} id Simulation action identity.
 * @property {CoursePoint & {height?:number,surfaceRadius?:number}} target
 * @property {number} height Visible interaction point above the floor.
 * @property {number} reach Activation distance in metres.
 * @property {number} feedbackReach Request-only explanation distance.
 * @property {number} facing Horizontal half angle in radians.
 * @property {string} name
 * @property {string} label
 * @property {string} detail
 */

function requireRule(valid, name, rule) {
  if (!valid) throw new Error(`${name}: ${rule}`);
}
function point(value, name) {
  requireRule(value && Number.isFinite(value.x) && Number.isFinite(value.y), name, 'finite x/y required');
}
function positive(value, name) {
  requireRule(Number.isFinite(value) && value > 0, name, 'must be positive and finite');
}
function text(value, name) {
  requireRule(typeof value === 'string' && value.trim().length > 0, name, 'non-empty text required');
}

/** Validate references after layout compaction, before any consumer builds caches. */
export function validateEncounters({arrival, crossings, searchPoints, bunkerInspection, rangeInspection}, waters) {
  point(arrival?.spawn, 'Arrival spawn');
  point(arrival?.landing, 'Arrival landing');
  requireRule(Number.isFinite(arrival.triggerY), 'Arrival', 'finite triggerY required');
  positive(arrival.doorSeconds, 'Arrival doorSeconds');
  positive(arrival.walkSeconds, 'Arrival walkSeconds');
  requireRule(Array.isArray(searchPoints) && searchPoints.length > 0, 'Search', 'at least one destination required');
  searchPoints.forEach((p, i) => point(p, `Search ${i}`));
  for (const [name, inspection, fields] of [
    ['Bunker inspection', bunkerInspection, ['minimumY', 'maximumX']],
    ['Range inspection', rangeInspection, ['minimumX', 'minimumY', 'maximumY']],
  ]) {
    point(inspection?.target, name);
    positive(inspection.afterSeconds, `${name} afterSeconds`);
    for (const field of fields) requireRule(Number.isFinite(inspection[field]), name, `${field} must be finite`);
  }
  requireRule(rangeInspection.minimumY < rangeInspection.maximumY, 'Range inspection', 'approach bounds are reversed');
  validateCrossings(crossings, waters);
}

export function validateCrossings(crossings, waters) {
  requireRule(Array.isArray(crossings) && crossings.length > 0, 'Crossings', 'definitions required');
  const byId = new Map(), byWater = new Map(waters.map(w => [w.id, w]));
  for (const c of crossings) {
    const name = `Crossing ${c?.id ?? '(unnamed)'}`;
    text(c?.id, name);
    requireRule(!Object.hasOwn(Object.prototype, c.id), name, 'id conflicts with report dictionary keys');
    requireRule(!byId.has(c.id), name, 'duplicate id');
    byId.set(c.id, c);
    requireRule(['x', 'y'].includes(c.axis), name, 'axis must be x or y');
    requireRule([-1, 1].includes(c.direction) && [-1, 1].includes(c.drySide), name, 'directions must be -1 or 1');
    for (const field of ['entry', 'exit', 'center']) requireRule(Number.isFinite(c[field]), name, `${field} must be finite`);
    requireRule((c.exit - c.entry) * c.direction > 0, name, 'entry/exit must follow direction');
    positive(c.dryX, `${name} dryX`);
    positive(c.lateralReach, `${name} lateralReach`);
    requireRule(c.dryX < c.lateralReach, name, 'dry branch must fit observation envelope');
    for (const field of ['minLateral', 'maxLateral']) {
      requireRule(c[field] === undefined || Number.isFinite(c[field]), name, `${field} must be finite when present`);
    }
    requireRule((c.minLateral ?? -Infinity) < (c.maxLateral ?? Infinity), name, 'lateral bounds are reversed');
    requireRule(c.requiresBypass === undefined || typeof c.requiresBypass === 'boolean', name, 'requiresBypass must be boolean');
    requireRule(Array.isArray(c.channels) && c.channels.length > 0, name, 'explicit channels required');
    requireRule(new Set(c.channels).size === c.channels.length, name, 'duplicate channel');
    requireRule(c.channels.includes(c.water), name, 'arrival water must belong to channels');
    for (const id of c.channels) {
      const w = byWater.get(id);
      requireRule(w, name, `unknown channel ${id}`);
      requireRule((w.axis || 'y') === c.axis, name, `channel ${id} has a different axis`);
      requireRule(w[c.axis] > Math.min(c.entry, c.exit) && w[c.axis] < Math.max(c.entry, c.exit), name, `channel ${id} lies outside entry/exit`);
    }
  }
  for (const c of crossings) if (c.parent !== undefined) {
    const parent = byId.get(c.parent), name = `Crossing ${c.id}`;
    requireRule(parent && parent !== c && parent.parent === undefined, name, 'parent must be a distinct top-level encounter');
    requireRule(parent.axis === c.axis && parent.direction === c.direction && parent.center === c.center, name, 'parent corridor must match');
    requireRule((c.entry - parent.entry) * c.direction >= 0 && (parent.exit - c.exit) * c.direction >= 0, name, 'child must fit parent span');
    requireRule(c.channels.every(id => parent.channels.includes(id)), name, 'parent must include child channels');
  }
}

export function validateInteractions(controls) {
  const required = new Set(['bypass', 'note', 'gate']);
  requireRule(Array.isArray(controls), 'Interactions', 'definitions required');
  for (const c of controls) {
    const name = `Interaction ${c?.id ?? '(unnamed)'}`;
    requireRule(required.delete(c?.id), name, 'unknown or duplicate action');
    point(c.target, name);
    positive(c.height, `${name} height`);
    positive(c.reach, `${name} reach`);
    positive(c.feedbackReach, `${name} feedbackReach`);
    requireRule(c.feedbackReach >= c.reach, name, 'feedback reach cannot be shorter than activation reach');
    positive(c.facing, `${name} facing`);
    requireRule(c.facing <= Math.PI, name, 'facing cannot exceed pi');
    requireRule(c.target.surfaceRadius === undefined || Number.isFinite(c.target.surfaceRadius) && c.target.surfaceRadius >= 0, name, 'invalid target surface radius');
    for (const field of ['name', 'label', 'detail']) text(c[field], `${name} ${field}`);
  }
  requireRule(required.size === 0, 'Interactions', 'bypass, note and gate definitions are required');
}

/** Freeze nested authored values too, so caches cannot silently become stale. */
export function freezeAuthored(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeAuthored);
    Object.freeze(value);
  }
  return value;
}
