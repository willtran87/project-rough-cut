import {validateWaterDefinitions} from './under-green-water-state.js';
// Metres, +x east / +y north. The course loops around a shared service junction.
// These are physical positions used by simulation, rendering and test routes.
export const FLOORS=[
 {x:0,y:38,w:6,d:76},{x:0,y:8,w:10,d:16},{x:-3,y:38,w:12,d:12},
 {x:-5.35,y:44.8,w:2.8,d:5},
 {x:0,y:57,w:10,d:8},{x:0,y:71,w:10,d:8},
 {x:6,y:57,w:12,d:5},{x:10,y:64,w:4,d:19},{x:6,y:72,w:12,d:5},
 {x:-10,y:73,w:26,d:6},{x:-20,y:58,w:6,d:30},
 {x:-20,y:70,w:10,d:7},{x:-20,y:54,w:10,d:7},
 {x:-25,y:70,w:14,d:4},{x:-30,y:62,w:4,d:20},{x:-25,y:54,w:14,d:4},
 {x:-20,y:40,w:14,d:16},{x:-10,y:40,w:20,d:4},
 {x:6,y:38,w:18,d:6},{x:12,y:23,w:6,d:36},
 {x:12,y:23.5,w:10,d:5},{x:17,y:23.5,w:10,d:5},{x:12,y:13,w:10,d:4},
 {x:16,y:38,w:12,d:5},{x:21,y:25.5,w:4,d:29},{x:16,y:13,w:12,d:5},
 {x:12,y:2,w:10,d:10}
];
export const LEVER={x:-24,y:40},NOTE={x:-24.15,y:56.6,height:1.35},EXIT={x:12,y:2},SLUICE={x:14.65,y:2,height:1.535,surfaceRadius:.4};
export const GATE={x:12,y:5.8,width:10,direction:-1};
export const OBSTACLES=[
 {id:'service-door-jamb',x:-6.5,y:43.75,w:.5,d:4},
 {id:'service-door-right-jamb',x:-4.4,y:44.75,w:.2,d:2},
 {id:'root-pillar',x:-1.8,y:15,w:1,d:1},
 {id:'bunker-buttress',x:-17.8,y:56,w:.8,d:1.6},
 {id:'pump-buttress',x:-21,y:43,w:1,d:2},
 {id:'pump-machine',x:-26,y:43,w:2,d:3},
 // The handle and gauges reach 1.48m; this low control blocks bodies, not
 // a standing eye ray. Other cover keeps its existing full-height policy.
 {id:'pump-control',...LEVER,w:.8,d:.7,sightHeight:1.48},
 {id:'record-stand',...NOTE,w:.6,d:.45},
 {id:'sluice-console',...SLUICE,w:.45,d:.55},
 {id:'range-island',x:15.8,y:25,w:.8,d:.8}
];
/** @type {import('./under-green-water-state.js').WaterDefinition[]} */
export const WATERS=[
 // Drain approach reaches the first opening at walking pace; the cycle stays periodic.
 {id:'lesson',control:'cycle',lowSeconds:5,name:'ROOT GALLERY',x:0,y:23,width:6,depth:4,offset:8,lesson:true},
 {id:'spillway',control:'cycle',name:'EAST SPILLWAY',x:0,y:64,width:6,depth:8,offset:3,lowSeconds:4,detour:'East dry walkway'},
 {id:'bunker',control:'cycle',lowSeconds:3,name:'BUNKER DRAIN',x:-20,y:62,width:6,depth:6,offset:7,forward:-1,detour:'West maintenance walk'},
 {id:'return',control:'pump-return',name:'BYPASS RETURN',x:-20,y:49,width:6,depth:3,forward:-1},
 {id:'bypass',control:'pump-outflow',name:'PUMP OUTFLOW',x:6,y:38,axis:'x',width:6,depth:4},
 {id:'range-a',control:'cycle',lowSeconds:3,name:'RANGE OUTLET A',x:12,y:29,width:6,depth:6,offset:7,forward:-1,detour:'East dry perimeter'},
 // B opens three seconds after A. Its window connects to the keeper spillway
 // so a well-timed crossing can preserve its lead through the entire sequence.
 {id:'range-b',control:'cycle',lowSeconds:3,name:'RANGE OUTLET B',x:12,y:18,width:6,depth:6,offset:4,forward:-1,detour:'Dry walkway from the middle landing'},
 // The keeper window follows B by .75s, retaining a cautious crossing's lead
 // without synchronizing all three banks or extending their safe durations.
 {id:'sluice',control:'cycle',lowSeconds:3,name:'KEEPER SPILLWAY',x:12,y:9,width:6,depth:3,offset:3.25,forward:-1}
];
export const BOUNDS={minX:-33,maxX:24,minY:-3,maxY:77};
export const CHECKPOINT_LAYOUT=[
 {x:0,y:5,yaw:0,time:0,joeX:-5.35,joeY:45.1},
 {x:-5,y:73,yaw:-Math.PI/2,time:24,joeX:0,joeY:55},
 {x:-16,y:40,yaw:Math.PI/2,time:50,joeX:-22,joeY:40},
 {x:12,y:23.5,yaw:Math.PI,time:67,joeX:12,joeY:36}
];
export const DRY_ROUTES=[
 [[0,57],[10,57],[10,72],[0,72]],
 [[-20,70],[-30,70],[-30,54],[-20,54]],
 [[12,38],[21,38],[21,13],[12,13]],
 // The middle landing is a real branch connection, not a dead-end refuge.
 // Continue its marking to the perimeter so either outlet can be bypassed.
 [[12,23.5],[21,23.5]]
];
// Readable main-loop route. The service shortcut is available to both actors;
// it passes Joe's entrance and trades an early confrontation for distance.
export const MAIN_ROUTE=[{x:0,y:55},{x:10,y:57},{x:10,y:72},{x:0,y:73},{x:-20,y:73},{x:-30,y:70},{x:-30,y:54},{x:-20,y:54},LEVER,{x:-16,y:40},{x:0,y:40},{x:12,y:38},{x:21,y:38},{x:21,y:13},{x:12,y:13},SLUICE];
export function districtAt(p){
 if(p.x>6&&p.y<42)return p.y<rangeY(6)?'KEEPER’S ROOM':'THE ABANDONED RANGE';
 if(p.x<-12)return p.y<51?'THE PUMP HOUSE':'BENEATH THE BUNKER';
 if(p.x<-4&&p.y<46)return 'MAINTENANCE JUNCTION';
 return p.y<35?'THE ROOT GALLERY':'EAST SPILLWAY';
}
export function roofAt(x,y){return !(x<-12&&y>51)&&!(x>6&&y>=rangeY(6)&&y<rangeY(35));}

// Compact the last district around its entrance; preserve corridor widths and
// the on-foot movement profile. Shared objects are transformed only once.
export const RANGE_SCALE=.65;
export const rangeY=y=>38+(y-38)*RANGE_SCALE;
const rangeObjects=new Set();
const compact=p=>{if(rangeObjects.has(p)||p.x<=6||p.y>41)return;rangeObjects.add(p);p.y=rangeY(p.y);};
for(const floor of FLOORS)if(floor.x>=12){compact(floor);floor.d*=RANGE_SCALE;}
for(const p of [EXIT,SLUICE,GATE,...OBSTACLES,...WATERS,...MAIN_ROUTE])if(p.x>6){compact(p);if(p.depth)p.depth*=RANGE_SCALE;}
for(const c of CHECKPOINT_LAYOUT)if(c.x>6){compact(c);c.joeY=rangeY(c.joeY);}
for(const path of DRY_ROUTES)if(path[0][0]>6)for(const p of path)p[1]=rangeY(p[1]);

// Construct after range compaction so every roof, signal and hoist consumer
// shares the same physical opening without depending on rendering modules.
export const GATE_ROOF_SLOT=Object.freeze({id:'keeper-gate-pocket',x:GATE.x,y:GATE.y,w:GATE.width+.32,d:.66});

// Fail at load time instead of silently presenting an invalid crossing.
validateWaterDefinitions(WATERS);
