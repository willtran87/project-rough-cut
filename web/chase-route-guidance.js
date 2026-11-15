import {COURSE,distance} from './back-nine-course.js';

const hints={
 'pump-yard':['Pump yard · faster road right; the narrow maintenance gap left blocks the mower.','Pump yard · use the narrow gap left, then turn behind the store for cover.'],
 'range-works':['Service court · open road right; cart gap left. Both reconnect beyond the court.','Service court · the outermost paved gap fits you; Joe must go around the hedge.'],
 'service-approach':['Garage approach · fast bend right; narrow service gap left. Both reach the garage.','Garage approach · the outermost paved gap avoids the cart lane and rejoins at the garage.'],
 'reservoir-loop':['Reservoir fork · direct path left; longer covered lane with a narrow gate right.','Reservoir fork · inset paving follows the outside of the gate; the cart cannot fit there.'],
 'dry-range':['Range fork · shorter wet lanes left; longer dry perimeter right, with a narrow gate.','Range fork · the dry perimeter offers a narrow gate; the flooded crossover is exposed.']
};
// Optional text follows real junctions, never a screen arrow or a target behind
// scenery. Critical interaction/attack messages retain priority in the caller.
export function routeHint(run){
 if(run.mode!=='driving'||run.joe.ram.phase!=='none'||run.joe.ram.footCharge>0||run.hunt.phase!=='follow')return '';
 const actor=run.foot||run.cart;let best=null,gap=Infinity;
 for(const d of COURSE.decisions){const n=distance(actor,d.entry);if(actor.y>d.gate.y-2||actor.y<d.entry.y-22||n>34||n>=gap)continue;gap=n;best=d;}
 return best?hints[best.id][run.foot?1:0]:'';
}
