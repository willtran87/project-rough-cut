// At most one optional area accent waits. Leaving the area or waiting too long
// discards it; returning cannot produce a backlog of old scares.
export const freshZoneCueQueue=count=>({seen:Array(count).fill(false),pending:null,queued:0,played:0,dropped:0,lastDrop:null});
export function requestZoneCue(q,index,time){
 if(index<0||index>=q.seen.length||q.seen[index])return false;
 q.seen[index]=true;
 if(q.pending){q.dropped++;q.lastDrop='superseded';}
 q.pending={index,at:time,clearSeconds:0};q.queued++;return true;
}
export function advanceZoneCue(q,dt,f){
 if(!f.active||!q.pending)return null;
 const p=q.pending;
 if(f.zone!==p.index||f.time-p.at>24){q.dropped++;q.lastDrop=f.zone!==p.index?'left_area':'expired';q.pending=null;return null;}
 p.clearSeconds=f.allowed?p.clearSeconds+Math.max(0,dt):0;
 if(p.clearSeconds<1.25)return null;
 q.pending=null;q.played++;return p.index;
}
export function zoneCuePriority(f){
 const reasons=[['opening',f.opening],['danger',f.danger],['interaction',f.interaction],['important_message',f.message],['observed_scene',f.observedScene],['ghost',f.ghost],['recovery',f.recovery],['other_accent',f.accent]];
 return reasons.find(([,blocked])=>blocked)?.[0]||null;
}
