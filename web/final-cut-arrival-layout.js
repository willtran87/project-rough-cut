// Coordinates use the chapter's x/east, y/towards-road convention. The raised
// overlook and both ramps share this surface function with the player camera.
export const OVERLOOK={x:-2,y:0,w:12,d:10,h:4.8};
export const OVERLOOK_RAMPS={entry:{start:-14,end:-5},exit:{start:5,end:17}};
export const ARRIVAL_SPAWNS={
 garage:{x:-18,y:-15,yaw:Math.PI/2,pitch:0},
 drain:{x:18,y:-15,yaw:-Math.PI/2,pitch:0},
 direct:{x:-2,y:2.5,yaw:.05,pitch:.2},
};
export const BAY={x:33,y:17,w:7,d:6};
// The opening machine waits on the course-side apron. Subsequent ambushes
// still stage beyond x±30 behind the full-height, unchanged reed screens.
export const OPENING_RIG={x:24.6,y:26,yaw:-Math.PI/2};
export const ACCESS={id:'course-access',x:-3.5,y:17.3,label:'Open the final round · wait behind the rail'};
// A second physical control lets the player watch deployment from elevation.
export const OVERLOOK_ACCESS={id:'course-access',x:-3.5,y:4.1,label:'Begin final round · watch from the overlook'};
export const ACCESS_GATE={x:-2,y:19.5,w:4,d:.12,h:1.1};
export const ACCESS_FENCE=[{x:-14.5,y:19.5,w:21,d:.12,h:1.1},{x:12.5,y:19.5,w:25,d:.12,h:1.1}];
export const BOARDING_PATH=[{x:30.5,y:18},{x:OPENING_RIG.x+.45,y:OPENING_RIG.y-2.08}];
export const ARRIVAL_WALLS=[
 {id:'overlook-west',x:-8,y:0,w:.35,d:10,h:OVERLOOK.h+1.1},
 {id:'overlook-east',x:4,y:0,w:.35,d:10,h:OVERLOOK.h+1.1},
 ...[-5.5,1.5].flatMap(x=>[-5,5].map(y=>({id:`overlook-edge-${x}-${y}`,x,y,w:4.8,d:.35,h:OVERLOOK.h+(y>0?.7:1.1)}))),
 ...Object.entries(OVERLOOK_RAMPS).flatMap(([name,ramp])=>[-4.25,.25].flatMap(x=>Array.from({length:ramp.end-ramp.start},(_,i)=>({id:`arrival-${name}-rail-${x}-${i}`,x,y:ramp.start+i+.5,w:.3,d:1.02,h:OVERLOOK.h*(name==='entry'?(i+.5)/(ramp.end-ramp.start):1-(i+.5)/(ramp.end-ramp.start))+1.05})))),
 ...[-1,1].flatMap(side=>[
  {id:`entry-back-${side}`,x:side*22,y:-15,w:.4,d:5,h:3.3},
  {id:`entry-south-${side}`,x:side*18,y:-17.5,w:8,d:.4,h:3.3},
  {id:`entry-north-${side}`,x:side*18,y:-12.5,w:8,d:.4,h:3.3},
 ]),
];
export function groundHeight(p){
 if(p.x<-8.1||p.x>4.1)return 0;
 if(p.y>=-5&&p.y<=5)return OVERLOOK.h;
 if(p.x<-4.1||p.x>.1)return 0;
 if(p.y>OVERLOOK_RAMPS.entry.start&&p.y<-5)return (p.y-OVERLOOK_RAMPS.entry.start)/(-5-OVERLOOK_RAMPS.entry.start)*OVERLOOK.h;
 if(p.y>5&&p.y<OVERLOOK_RAMPS.exit.end)return (OVERLOOK_RAMPS.exit.end-p.y)/(OVERLOOK_RAMPS.exit.end-5)*OVERLOOK.h;
 return 0;
}
