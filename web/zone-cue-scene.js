// World-space source shared by the visible event, caption and spatial sound.
// Choose once when the event starts so looking/moving cannot move its source.
export function zoneCueAnchor(id,seed,origin,blockers,ponds){
 let anchor={x:Math.max(-11,Math.min(11,origin.x+(seed%2?-3:3))),z:origin.z-5};
 const nearest=items=>items.reduce((a,b)=>Math.hypot(a.x-origin.x,a.z-origin.z)<Math.hypot(b.x-origin.x,b.z-origin.z)?a:b);
 if(id==='boundary_knock')anchor={x:origin.x<0?-13:13,z:origin.z-3};
 if(id==='submerged_lights'&&ponds.length)anchor={...nearest(ponds)};
 if(id==='hedge_breath'||id==='hedge_breach'){
  const hedges=blockers.filter(o=>o.id?.includes('hedge'));
  if(hedges.length){const h=nearest(hedges),dx=origin.x-h.x,dz=origin.z-h.z,n=Math.hypot(dx,dz)||1;anchor={x:h.x+dx/n*(h.rx+.12),z:h.z+dz/n*(h.rz+.12)};}
 }
 if(id==='door_cycle')anchor={x:20,z:-49.61};
 return anchor;
}

// Small environmental motifs; never reuse Joe's search/detection warning.
// Times in seconds, levels before distance and the user's ambience gain.
export function zoneCueSound(id){
 const noise=(duration,level,band,delay=0)=>({duration,level,band,delay});
 const tone=(from,to,duration,level,delay=0,type='triangle')=>({from,to,duration,level,delay,type});
 switch(id){
  case 'boundary_knock':return [tone(154,82,.16,.024),noise(.12,.012,900,.18)];
  case 'hedge_breath':return [noise(.52,.018,530)];
  case 'submerged_lights':return [tone(310,165,.26,.015,0,'sine'),noise(.30,.009,1400,.12)];
  case 'door_cycle':return [tone(96,62,.26,.018),noise(.12,.016,850,.20)];
  case 'hedge_breach':return [noise(.38,.023,1950),tone(136,68,.14,.012)];
  case 'range_volley':return [tone(820,350,.10,.016),tone(720,310,.12,.013,.16),tone(610,270,.10,.011,.31)];
  case 'release_sweep':return [tone(120,88,.30,.016),noise(.18,.010,650,.20)];
  default:return [];
 }
}
