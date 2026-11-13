import {validateCrossings} from './under-green-authoring.js';
import {recordLocal} from './local-telemetry.js';
import {waterState,inWater} from './under-green-course.js';

/**
 * Build references once. Reports use explicit channels and approach bounds,
 * so a display/report identity never silently changes encounter behavior.
 * @param {import('./under-green-authoring.js').CrossingDefinition[]} definitions
 * @param {import('./under-green-water-state.js').WaterDefinition[]} waters
 */
export function createCrossingObserver(definitions, waters) {
  validateCrossings(definitions, waters);
  const byWater = new Map(waters.map(w => [w.id, w]));
  const encounters = definitions.map(definition => ({
    definition,
    arrivalWater: byWater.get(definition.water),
    channels: definition.channels.map(id => byWater.get(id)),
  }));

  return function observeCrossings(run, gap, dt) {
    const telemetry = run.telemetry;
    if (!telemetry?.enabled) return;
    telemetry.crossings ??= {};
    for (const {definition: c, arrivalWater, channels} of encounters) {
      const along = run.player[c.axis];
      const lateral = run.player[c.axis === 'y' ? 'x' : 'y'];
      let event = telemetry.crossings[c.id];
      const beforeExit = c.parent ? (c.exit - along) * c.direction > 0 : (c.exit - along) * c.direction >= 0;
      const insideApproach = (!c.requiresBypass || run.bypass) &&
        lateral > (c.minLateral ?? -Infinity) && lateral < (c.maxLateral ?? Infinity) &&
        (along - c.entry) * c.direction >= 0 && beforeExit &&
        Math.abs(lateral - c.center) < c.lateralReach;

      if (!event && insideApproach) {
        const state = water => waterState(water, run.time, run.bypass, run.bypassAt);
        event = telemetry.crossings[c.id] = {
          id: c.id,
          ...(c.parent ? {parent: c.parent} : {}),
          start: run.time,
          arrivalPhase: state(arrivalWater).phase,
          arrivalPhases: Object.fromEntries(channels.map(w => [w.id, state(w).phase])),
          partial: !telemetry.samples || Math.abs(along - c.entry) > 1,
          choice: 'undecided', wetVisited: false, dryVisited: false,
          waitSeconds: 0, minimumGap: gap, waterHits: run.waterHits,
        };
        recordLocal(telemetry, 'crossing-enter', run.time, {id: c.id, phase: event.arrivalPhase, gap});
      }
      if (!event || event.finished) continue;
      event.minimumGap = Math.min(event.minimumGap, gap);
      if (channels.some(w => inWater(run.player, w))) event.wetVisited = true;
      const alongsideChannel = !c.parent || channels.some(w => Math.abs(along - w[c.axis]) <= w.depth / 2);
      if (alongsideChannel && (lateral - c.center) * c.drySide > c.dryX) event.dryVisited = true;
      event.choice = event.wetVisited && event.dryVisited ? 'mixed' : event.dryVisited ? 'dry' : event.wetVisited ? 'wet' : 'undecided';
      if (run.player.speed < .15 && !run.player.recovery) event.waitSeconds += dt;
      if ((along - c.exit) * c.direction > 0) {
        event.finished = true;
        event.seconds = run.time - event.start;
        event.exitGap = gap;
        event.waterHits = run.waterHits - event.waterHits;
        recordLocal(telemetry, 'crossing-exit', run.time, {...event});
      }
    }
  };
}
