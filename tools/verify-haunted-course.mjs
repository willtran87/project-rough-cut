import assert from 'node:assert/strict';
import {createGhostBehavior,createGhostSightings} from '../web/ghost-motion.js';
import {courseLook,COURSE_LOOKS} from '../web/course-atmosphere.js';
const anchor={x:0,y:0,z:0,yaw:0},player={x:0,z:-10,yaw:Math.PI};
for(const hz of [20,60,144]){
 const watcher=createGhostBehavior(),follower=createGhostBehavior();let held,crept,settled,moved;
 for(let i=0;i<=hz*9;i++){
  const t=i/hz,p={...player,yaw:t>3&&t<6?0:Math.PI};
  const w=watcher.sample('watch:3',anchor,t,p,'watcher');
  const f=follower.sample('follow:1',anchor,t,{...player,x:t<3?0:t<5?t-3:2},'stalker');
  assert(w.distance<=1.6&&f.distance<=3);
  if(t===3)held=w.distance;if(t===6)crept=w.distance;
  if(t===5)moved=f.distance;if(t===7)settled=f.distance;
  if(t===9){assert.equal(held,0);assert(crept>.8);assert.equal(w.distance,crept);assert(moved>.8);assert(f.distance-settled<.01);assert.equal(follower.sample('follow:1',anchor,t,{...player,x:2},'stalker').distance,f.distance);}
 }
}
const q=createGhostSightings(),sites=[{x:0,y:50},{x:2,y:60}];
const first=q.sample(0,true,sites,()=>true);assert.equal(first.alpha,0);assert.equal(first.phase,'warning');
assert(q.sample(3,true,sites,()=>true).alpha>.4);q.sample(first.end,true,sites,()=>true);
assert.equal(q.stats().phase,'recovery');assert.equal(q.sample(first.end+13,true,sites,()=>true),null);
const second=q.sample(q.stats().next,true,sites,()=>true);assert.notEqual(first.index,second.index);assert.equal(second.phase,'warning');
q.sample(second.end,true,sites,()=>true);q.sample(q.stats().next+1,true,[],()=>false);assert.equal(q.stats().phase,'quiet','No eligible site must not prolong recovery forever');
q.sample(50,false,sites,()=>true);assert.equal(q.stats().phase,'suppressed');assert.equal(q.sample(51,true,sites,()=>true),null);
assert.equal(q.sample(0,true,sites,()=>true).index,0,'Run reset restores sequence');
for(const look of COURSE_LOOKS){const sample=courseLook(look.start+30);assert.equal(sample.a.id,look.id);}
for(let y=0;y<730;y+=.1){const a=courseLook(y),b=courseLook(y+.001),power=s=>s.a.power+(s.b.power-s.a.power)*s.mix;assert(Math.abs(power(a)-power(b))<.001);assert(a.mix>=0&&a.mix<=1);}
console.log('PASS: three-rate watcher/follower counterplay, stopped/duplicate stability, warning/recovery cadence, reset and continuous zone blends');
