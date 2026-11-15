import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as underground from '../web/under-green-sim.js';
import * as finale from '../web/final-cut-sim.js';
const near=(a,b,label)=>assert(Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`),reports=[];
for(const hz of [30,60,120])for(const [name,input,speed]of [
 ['walk',{forward:1},3.84],['run',{forward:1,sprint:true},6.08],
 ['listen',{forward:1,sprint:true,focus:true},2.4],['crouch',{forward:1,crouch:true},2.4],
 ['diagonal',{forward:1,strafe:1},3.84]
]){
 const samples=[];
 for(const [chapter,sim]of [['under-green',underground],['final-cut',finale]]){
  const r=sim.createRun();r.mode='playing';if(chapter==='final-cut')Object.assign(r.player,{x:16,y:8,yaw:0});
  const p=r.player,start={...p};sim.step(r,{...input,acceleration:true},1/hz);
  const first=Math.hypot(p.x-start.x,p.y-start.y);assert(first>0&&first<speed/hz);
  for(let n=0;n<Math.ceil(.1*hz);n++)sim.step(r,{...input,acceleration:true},1/hz);
  near(p.speed,speed,'settled speed');const stopped={...p};sim.step(r,{acceleration:true},1/hz);near(p.x,stopped.x,'stop x');near(p.y,stopped.y,'stop y');
  // Re-enable after moving with easing disabled: no old completed ramp survives.
  sim.step(r,input,1/hz);const before={...p};sim.step(r,{...input,acceleration:true},1/hz);
  const reenabled=Math.hypot(p.x-before.x,p.y-before.y);near(reenabled,first,'re-enabled start');
  samples.push({chapter,first,reenabled});
 }
 near(samples[0].first,samples[1].first,'same response despite finale collision substeps');reports.push({hz,name,samples});
}
fs.mkdirSync('output/on-foot-start-response',{recursive:true});fs.writeFileSync('output/on-foot-start-response/simulation.json',JSON.stringify({passed:true,reports},null,2));console.log(JSON.stringify({passed:true,comparisons:reports.length,chapterCases:reports.length*2}));
