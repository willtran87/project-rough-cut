import assert from 'node:assert/strict';
import {createGhostBehavior,createGhostFeedback} from '../web/ghost-motion.js';
const anchor={x:0,y:0,z:0,yaw:0},player={x:0,z:-10,yaw:Math.PI};
const results=[];
function sampleRun(serial,hz=100){
 const b=createGhostBehavior(),key='ambient:variety:'+serial,frames=[];
 b.sample(key,anchor,0,player,'rusher');b.sample(key,anchor,.8,player,'rusher');
 for(let i=1;i<=Math.ceil(13.2*hz);i++)frames.push(b.sample(key,anchor,.8+i/hz,player,'rusher'));
 return {b,key,frames};
}
for(const serial of [2,5,8,11]){
 const {b,key,frames}=sampleRun(serial),name=frames[0].movementPattern;
 assert(frames.every(f=>f.movementPattern===name&&f.distance>=0&&f.distance<=6.2&&Math.abs(f.movementSpeed)<=6.2));
 assert(frames.every(f=>Math.hypot(f.x-player.x,f.z-player.z)>=2.05));
 assert(frames.slice(1).every((f,i)=>Math.abs(f.distance-frames[i].distance)<.063),'No jumps at rhythm boundaries');
 assert(frames.some(f=>f.behaviorPhase==='rush'&&f.movementSpeed>1));
 assert(frames.some(f=>f.behaviorPhase==='withdraw'&&f.movementSpeed<-.1));
 assert.deepEqual(b.sample(key,anchor,14,player,'rusher'),frames.at(-1));
 assert.equal(frames.at(-1).alpha,0);
 if(name==='false-retreat')assert(frames.some(f=>f.behaviorPhase==='withdraw'&&f.movementSpeed>.2),'False retreat includes a small reapproach');
 if(name==='hesitate')assert(frames.some(f=>f.behaviorPhase==='rush'&&f.distance>.1&&f.movementSpeed===0),'Hesitation visibly stops within the rush');
 const feedback=createGhostFeedback(),starts=[];let previous=null;
 for(let i=0;i<frames.length;i++){
  const f=frames[i],pulse=feedback.sample(.81+i/100,{key,seen:true,phase:f.behaviorPhase,gesture:f.gesture,side:1});
  if(pulse?.kind&&pulse.kind!==previous)starts.push(pulse.kind);previous=pulse?.kind||null;
  if(f.gesture==='hesitate')assert.equal(f.movementSpeed,0);
  if(f.gesture==='feint')assert(f.behaviorPhase==='withdraw'&&f.movementSpeed>0);
 }
 if(name==='hesitate'||name==='false-retreat')assert.equal(starts.filter(k=>k==='hesitate').length,1);
 if(name==='false-retreat')assert.equal(starts.filter(k=>k==='feint').length,1);
 const signature=frames.filter((_,i)=>i%50===0).map(f=>+f.distance.toFixed(3));
 results.push({name,signature});
 // Shared timestamps agree across frame rates with the same perception event.
 const low=sampleRun(serial,20).frames;
 for(let i=0;i<low.length;i++)assert(Math.abs(low[i].distance-frames[(i+1)*5-1].distance)<1e-8);
}
assert.equal(new Set(results.map(r=>r.name)).size,4);assert.equal(new Set(results.map(r=>JSON.stringify(r.signature))).size,4);
const sweep=createGhostBehavior();sweep.sample('ambient:sweep:8',anchor,0,player,'rusher');sweep.sample('ambient:sweep:8',anchor,.8,player,'rusher');
assert.equal(sweep.sample('ambient:sweep:8',anchor,5,{x:0,z:-3,yaw:0},'rusher').alpha,0,'A long frame cannot cross the live player');
assert.equal(sweep.sample('ambient:sweep:8',anchor,6,player,'rusher').alpha,0,'Aborted sightings stay dissolved');
console.log(JSON.stringify({passed:true,patterns:results.map(r=>r.name),checks:['Distinct fixed rhythms, rush hesitation and retreat feint','Continuous bounded movement, stable duplicate timestamps, matching 20/100Hz paths','Checked corridor and swept live-player clearance, finite fade']},null,2));
