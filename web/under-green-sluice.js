import {gateOccupied,keeperInside} from './under-green-course.js';
import {weaponAtGate} from './under-green-clearance.js';

export const SLUICE_RECOVERY='Draw Joe across the spillway on a safe opening. Dodge his swing, then run back to the release.';
export const SLUICE_COMMITMENT='Stay inside until the steel barrier is secured.';

// The release and its feedback share the existing physical interlock. This
// does not grant closure while either Joe's body or carried tool obstructs it.
export function sluiceObstruction(run){
 if(gateOccupied(run.joe))return keeperInside(run.joe)?'room':'threshold';
 return weaponAtGate(run.joe)?'threshold':null;
}

export function sluiceObstructionMessage(reason){
 return (reason==='room'?'Joe is inside. ':'The threshold is blocked. ')+SLUICE_RECOVERY;
}
