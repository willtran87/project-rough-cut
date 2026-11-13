// Local coordinates: x across the bed, y along the crossing.
// Water rendering and physical nozzle fixtures share these authored outlets.
export const NOZZLE_HEIGHT=1.05;
export function channelNozzles(w){
 // Keep the lip just proud of the retaining wall, outside the crouched eye's
 // wide-FOV near volume. Both the fixture and its jet use this same position.
 return [-1,1].flatMap(side=>[-1,0,1].map(row=>({side,row,x:side*(w.width/2-.14),y:row*w.depth*.32,height:NOZZLE_HEIGHT})));
}
export function channelJets(w){
 return channelNozzles(w).flatMap(nozzle=>(nozzle.row?[nozzle.row]:[-1,1]).map(direction=>({
  start:{x:nozzle.x,y:nozzle.y,height:nozzle.height},
  control:{x:nozzle.side*.65,y:nozzle.y+direction*w.depth*.1,height:1.42},
  end:{x:-nozzle.side*.48,y:Math.max(-w.depth/2+.35,Math.min(w.depth/2-.35,nozzle.y+direction*w.depth*.14)),height:.12},direction
 })));
}
export function jetPoint(jet,t){
 const a=(1-t)*(1-t),b=2*(1-t)*t,c=t*t;
 return {x:jet.start.x*a+jet.control.x*b+jet.end.x*c,y:jet.start.y*a+jet.control.y*b+jet.end.y*c,height:jet.start.height*a+jet.control.height*b+jet.end.height*c};
}
