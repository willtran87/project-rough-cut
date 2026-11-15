import assert from 'node:assert/strict';
import {createGhostGaze,createGhostFeedback} from '../web/ghost-motion.js';
const source={x:0,z:0},player={x:0,z:-10,yaw:Math.PI},coverage={stare:new Set(),lookaway:new Set(),lookback:new Set()},combinations=new Set();
for(let serial=1;serial<=64;serial++){
 const key='ambient:0:'+serial,gaze=createGhostGaze(),feedback=createGhostFeedback(),events=[],weights=[];let previous=null;
 for(let i=0;i<=800;i++){
  const t=i/100,p={...player,yaw:t>=2.4&&t<4.2?0:Math.PI},r=gaze.sample(key,t,source,p),f=feedback.sample(t,{key,seen:true,phase:'watching',gazeGesture:r.gesture,gazeVariant:r.variant});
  assert.deepEqual(gaze.sample(key,t,source,p),r);
  if(r.gesture&&r.gesture!==previous){events.push(r.gesture);coverage[r.gesture].add(r.variant);assert.equal(f.variant,r.variant);}
  previous=r.gesture;
  if(f)assert(f.strength>=0&&f.strength<=.48);
  const w=[r.fixation,r.abandonment,r.recoil];assert(w.every(v=>v>=0&&v<=1));if(weights.length)assert(w.every((v,j)=>Math.abs(v-weights.at(-1)[j])<.12),'Pose envelopes remain continuous');weights.push(w);
  combinations.add(JSON.stringify(r.variants));
 }
 assert.deepEqual(events,['stare','lookaway','lookback']);
 const restarted=createGhostGaze().sample(key,0,source,player),again=gaze.sample(key,0,source,player);assert.deepEqual(again,restarted,'Time reset reproduces a stable encounter');
}
for(const s of Object.values(coverage))assert.deepEqual([...s].sort(),[0,1,2]);assert(combinations.size>=20,'Responses are chosen independently, not three predictable fixed sequences');
console.log(JSON.stringify({passed:true,encounters:64,combinations:combinations.size,coverage:Object.fromEntries(Object.entries(coverage).map(([k,v])=>[k,[...v].sort()]))},null,2));
