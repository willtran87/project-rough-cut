import {timedHazard, eventHazard} from './hazard-timing.js';

/**
 * One schedule contract for simulation, navigation, signals, sound and advice.
 * Coordinates and recovery effects stay in the chapter's layout/simulation.
 * @typedef {'cycle'|'pump-return'|'pump-outflow'} WaterControl
 * @typedef {Object} WaterDefinition
 * @property {string} id Stable save/report identity; never selects behavior.
 * @property {string} name Player-facing place name.
 * @property {WaterControl} control Explicit schedule behavior.
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} depth
 * @property {'x'|'y'} [axis]
 * @property {-1|1} [forward] Authored route direction, independent of the cycle.
 * @property {boolean} [lesson] Teaching role; does not select a duration.
 * @property {string} [detour] Name of an existing dry route.
 * @property {number} [offset] Cycle offset in seconds; required for cycles.
 * @property {number} [lowSeconds] Low-flow duration; required for cycles.
 */
export const WATER_TIMING = Object.freeze({
  period: 12,
  warning: 1.5,
  surgeEnds: 10,
  pumpReturnWarning: 2,
});

/** Validate authored definitions once, after the layout's coordinate transform. */
export function validateWaterDefinitions(waters) {
  if (!Array.isArray(waters) || !waters.length) {
    throw new Error('Water definitions must be a non-empty array');
  }
  const ids = new Set();
  for (const water of waters) {
    const fail = message => { throw new Error(`Water ${water?.id ?? '(unnamed)'}: ${message}`); };
    if (!water || typeof water.id !== 'string' || !water.id.trim()) fail('id is required');
    if (ids.has(water.id)) fail('duplicate id');
    ids.add(water.id);
    if (typeof water.name !== 'string' || !water.name.trim()) fail('name is required');
    for (const field of ['x', 'y', 'width', 'depth']) {
      if (!Number.isFinite(water[field])) fail(`${field} must be finite`);
    }
    if (water.width <= 0 || water.depth <= 0) fail('dimensions must be positive');
    if (water.axis !== undefined && !['x', 'y'].includes(water.axis)) fail('axis must be x or y');
    if (water.forward !== undefined && ![-1, 1].includes(water.forward)) fail('forward must be -1 or 1');
    if (water.lesson !== undefined && typeof water.lesson !== 'boolean') fail('lesson must be boolean');
    if (water.detour !== undefined && (typeof water.detour !== 'string' || !water.detour.trim())) fail('detour must name a route');

    switch (water.control) {
      case 'cycle':
        if (!Number.isFinite(water.offset)) fail('cycle offset must be finite');
        if (!Number.isFinite(water.lowSeconds) || water.lowSeconds <= 0 ||
            water.lowSeconds + WATER_TIMING.warning >= WATER_TIMING.surgeEnds) {
          fail('lowSeconds must leave room for warning and surge');
        }
        break;
      case 'pump-return':
      case 'pump-outflow':
        if (water.offset !== undefined || water.lowSeconds !== undefined) fail('pump control cannot have cycle timing');
        if (water.lesson) fail('the protected lesson must use a cycle');
        break;
      default:
        fail('control must be cycle, pump-return or pump-outflow');
    }
  }
  if (waters.filter(water => water.lesson).length > 1) throw new Error('Only one protected water lesson is supported');
  return waters;
}

/** Full recurring safe window; event-controlled outlets have no next cycle. */
export function recurringSafeWindow(water) {
  return water.control === 'cycle' ? water.lowSeconds + WATER_TIMING.warning : null;
}

/**
 * `safeFor: null` means safe until an event, never an invented countdown.
 * Warning is still traversable; both surge and recession remain dangerous.
 * `cycle` is the cycle position, or age since pump operation for the return.
 */
export function waterState(water, time, bypass = false, bypassAt = -99) {
  if (water.control === 'pump-return') {
    const age = Math.max(0, time - bypassAt);
    if (!bypass) {
      return {phase: 'low', danger: false, level: .02, cycle: 0, ...eventHazard(true, 'bypass-open')};
    }
    if (age < WATER_TIMING.pumpReturnWarning) {
      const remaining = WATER_TIMING.pumpReturnWarning - age;
      return {phase: 'warning', danger: false, level: age / WATER_TIMING.pumpReturnWarning,
        cycle: age, ...timedHazard(remaining, remaining)};
    }
    return {phase: 'surge', danger: true, level: 1, cycle: age, ...eventHazard(false, 'chapter-restart')};
  }

  if (water.control === 'pump-outflow') {
    return {phase: bypass ? 'low' : 'surge', danger: !bypass, level: bypass ? .08 : 1, cycle: 0,
      ...eventHazard(bypass, bypass ? 'chapter-restart' : 'bypass-open')};
  }
  if (water.control !== 'cycle') throw new Error(`Water ${water.id}: unknown control ${water.control}`);

  const cycle = ((time + water.offset) % WATER_TIMING.period + WATER_TIMING.period) % WATER_TIMING.period;
  const safeEnds = recurringSafeWindow(water);
  if (cycle < water.lowSeconds) {
    return {phase: 'low', danger: false, level: .04, cycle,
      ...timedHazard(water.lowSeconds - cycle, safeEnds - cycle)};
  }
  if (cycle < safeEnds) {
    return {phase: 'warning', danger: false, level: .08 + (cycle - water.lowSeconds) * .28, cycle,
      ...timedHazard(safeEnds - cycle, safeEnds - cycle)};
  }
  if (cycle < WATER_TIMING.surgeEnds) {
    return {phase: 'surge', danger: true, level: 1, cycle, ...timedHazard(WATER_TIMING.surgeEnds - cycle)};
  }
  return {phase: 'receding', danger: true, level: 1 - (cycle - WATER_TIMING.surgeEnds) * .35, cycle,
    ...timedHazard(WATER_TIMING.period - cycle)};
}
