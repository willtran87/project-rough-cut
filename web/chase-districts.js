import {variationChoice} from './chase-variation.js';
// Spatial opportunities, not compulsory cutscenes or timed damage. The hunt
// still requires current evidence, room to maneuver and a connected corridor.
export const DISTRICT_ENCOUNTERS=[
 {id:'pump-yard-commitment',from:155,to:240,kind:'lane',choice:'Bait the open lane, then take the pump-yard gap or reservoir loop.'},
 {id:'range-interception',from:365,to:450,kind:'intercept',choice:'Break sight at the windbreak, then choose the flooded crossover or dry perimeter.'},
 {id:'clubhouse-pass',from:620,to:745,kind:'pass',choice:'Hold clear of the passing decks, or turn behind cover toward the service approach.'}
];
export function pendingDistrict(run){
 if(run.foot)return -1;
 for(let i=0;i<DISTRICT_ENCOUNTERS.length;i++){const d=DISTRICT_ENCOUNTERS[i];if(!(run.hunt?.districtMask&(1<<i))&&run.cart.y>=d.from+variationChoice(run,'district-entry',i,3)*10&&run.cart.y<d.to)return i;}
 return -1;
}
