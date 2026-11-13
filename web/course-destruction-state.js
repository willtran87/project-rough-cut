// Substantial buildings, water basins and the exit gate remain permanent.
// These movable/low course fixtures can be crushed by the industrial mower.
export const isDestructibleFeature=f=>['parked-cart','fallen-tree','service-fence'].includes(f.kind)||f.id==='reservoir-trailer';
export const featureBroken=(run,f)=>run?.destruction?.features?.[f.id]?.brokenAt!=null;
// Released equipment keeps one authored identity while collision, cameras and
// the detailed model share its run-local position.
export function featurePose(run,f){const s=run?.destruction?.features?.[f.id];return s?.x!=null?{...f,x:s.x,y:s.y}:f;}
export function breakCourseFeature(run,f,actor){
 const state=run?.destruction?.features?.[f.id];if(!state||state.brokenAt!==null)return false;
 const power=Math.max(.3,Math.min(1,Math.abs(actor.speed)/15));
 Object.assign(state,{brokenAt:run.time,dx:Math.sin(actor.yaw)*Math.sign(actor.speed),dy:Math.cos(actor.yaw)*Math.sign(actor.speed),power});
 run.destruction.serial++;run.events.push({type:'joe-destruction',id:f.id,time:run.time});
 const cue=run.courseFX.cue;run.courseFX.cue={serial:cue.serial+1,age:0,kind:['fallen-tree','service-fence'].includes(f.kind)?'timber':'metal',x:f.x,y:f.y,power};
 actor.speed*=.84;return true;
}
