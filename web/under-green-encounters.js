import {rangeY,WATERS} from './under-green-layout.js';
import {validateEncounters,freezeAuthored} from './under-green-authoring.js';
// Authored world positions and timings, independent of rendering and input.
export const ARRIVAL=freezeAuthored({
 triggerY:28.5,
 spawn:{x:-5.35,y:45.1},
 landing:{x:-5.35,y:40.55},
 doorSeconds:.5,
 walkSeconds:2.5,
});
/** @type {import('./under-green-authoring.js').CrossingDefinition[]} */
export const CROSSINGS=freezeAuthored([
 {
  id:'spillway',water:'spillway',channels:['spillway'],
  entry:53,exit:73,axis:'y',direction:1,center:0,
  drySide:1,dryX:5.5,lateralReach:14,
 },
 {
  id:'bunker',water:'bunker',channels:['bunker'],
  entry:73,exit:51,axis:'y',direction:-1,center:-20,
  drySide:-1,dryX:6.5,lateralReach:14,maxLateral:-13,
 },
 {
  id:'range',water:'range-a',channels:['range-a','range-b'],
  entry:38,exit:rangeY(12),axis:'y',direction:-1,center:12,
  drySide:1,dryX:6,lateralReach:14,minLateral:7,requiresBypass:true,
 },
 // Keep the aggregate for existing reports, and observe each outlet's choice
 // separately. Branch visits count alongside the channel, not at a connector.
 {
  id:'range-a',parent:'range',water:'range-a',channels:['range-a'],
  entry:38,exit:rangeY(23.5),axis:'y',direction:-1,center:12,
  drySide:1,dryX:6,lateralReach:14,minLateral:7,requiresBypass:true,
 },
 {
  id:'range-b',parent:'range',water:'range-b',channels:['range-b'],
  entry:rangeY(23.5),exit:rangeY(12),axis:'y',direction:-1,center:12,
  drySide:1,dryX:6,lateralReach:14,minLateral:7,requiresBypass:true,
 },
]);
// Patrol destinations are authored independently of the unseen player's location.
// The first inspection cuts back through the shared service passage to the pump.
export const SEARCH_POINTS=freezeAuthored([{x:-18,y:40},{x:0,y:40},{x:12,y:38},{x:12,y:rangeY(23.5)},{x:-20,y:54},{x:0,y:73}]);
// Having actually seen someone take the west bunker loop, the groundskeeper
// can inspect its known service exit after losing the trail. He must walk there.
export const BUNKER_INSPECTION=freezeAuthored({
 minimumY:70,maximumX:-1,afterSeconds:3.5,target:{x:-8,y:40},
});
// The east maintenance walkway visibly rejoins at the south range landing.
// Observing southward movement into it can justify inspecting that fixed exit.
export const RANGE_INSPECTION=freezeAuthored({
 minimumX:18,minimumY:rangeY(33),maximumY:rangeY(37),
 afterSeconds:1.5,target:{x:12,y:rangeY(13)},
});

validateEncounters({arrival:ARRIVAL,crossings:CROSSINGS,searchPoints:SEARCH_POINTS,bunkerInspection:BUNKER_INSPECTION,rangeInspection:RANGE_INSPECTION},WATERS);
