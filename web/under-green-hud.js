import {district,keeperInside} from './under-green-course.js';

// A quiet destination, not an event feed. Full route/closure guidance remains
// in the paused objective and text state; water timing owns its own HUD row.
export function hudObjective(run){
 if(run.finished)return 'Listen to the course above';
 if(run.closing)return 'Stay inside until the barrier seals';
 if(run.bypass)return keeperInside(run.player)?'Keep Joe outside; seal the sluice':'Reach the keeper’s sluice';
 return district(run.player)==='THE PUMP HOUSE'?'Open the red bypass lever':'Reach the pump house';
}
