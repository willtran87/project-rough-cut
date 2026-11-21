// Metres, in the course frame: x across the hole, y towards the public road.
// Shared by collision, the simulation and course art. No imports, so the
// course module can own the valves as solid fixtures.
//
// Four low places can be flooded, one at a time, and none of them stays wet.
// The three fairway hollows only hold the machine for a few seconds. The
// nursery swale is the one deep enough to keep it. It also holds its water
// longer: calling him across it takes one whole cycle of his.
export const BASIN_TIMING={fill:5,hold:14,drain:6,swaleHold:40,mire:6.5,wetAt:.3};
export const BASINS=[
 {id:'near',name:'near hollow',lane:0,x:0,y:26,w:8,d:9,valve:{x:0,y:32.45}},
 {id:'middle',name:'middle hollow',lane:1,x:8.5,y:50,w:8,d:9,valve:{x:8.5,y:43.55}},
 {id:'far',name:'far hollow',lane:2,x:-8.5,y:66,w:8,d:9,valve:{x:-9,y:59.55}},
 {id:'swale',name:'nursery swale',lane:3,x:8,y:74,w:12,d:12,final:true,valve:{x:.8,y:77}},
];
export const VALVES=BASINS.map(b=>({id:'valve-'+b.id,basin:b.id,x:b.valve.x,y:b.valve.y,w:.4,d:.4,h:1.7}));
// One breaker drops every floodlight bank for a few seconds. It is loud.
export const BREAKER={id:'breaker',x:15.25,y:41,w:.3,d:.5,h:1.5,label:'Throw the floodlight breaker'};
export const BLACKOUT={seconds:12,cooldown:40,sight:14,fade:.25,restore:1.5};
