// Shared by collision, course art and route verification. Walls are outside
// every deployed cutting strip; neither route depends on surviving rough.
export const ROUTE_WALLS=[
 // The low eastern end opens an honest view of the swale. The tall western
 // section still screens the longer approach before its exposed crossing.
 {id:'bank-parapet-west',x:-2,y:58.4,w:8,d:.6,h:2.2},
 {id:'bank-parapet-east',x:6,y:58.4,w:8,d:.6,h:1.25},
 {id:'pavilion-approach',x:-14.5,y:74.5,w:11,d:.6,h:2.2},
];
export const FORK={x:16,y:58};
export const FINAL_ROUTES={
 bank:[{x:12,y:56.8},{x:-8,y:56.8},{x:-8,y:76},{x:-10,y:78}],
 open:[{x:12,y:60},{x:-8,y:76},{x:-10,y:78}],
};
// Keep the practice basket west of the north/south mower clearance envelope.
export const AMBUSH_CORRIDOR_X=22.8;
export const FORK_BASKET={id:'balls-fork',x:14.5,y:56.2};
export const FORK_SIGN={id:'fork-sign',x:10.6,y:58.4,w:.1,d:1.8,h:1.98};
