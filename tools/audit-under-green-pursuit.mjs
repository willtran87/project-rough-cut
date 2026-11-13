import fs from 'node:fs';
import {traverse} from './probe-under-green-folded.mjs';
import {observeJoe} from '../web/under-green-senses.js';
import {district,distance,lineClear} from '../web/under-green-course.js';
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/pursuit-review';fs.mkdirSync(out,{recursive:true});
const runs=[];
for(const [name,options]of [
 ['walk',{dodge:true}],['wet-walk',{dodge:true,wet:true}],['run',{dodge:true,sprint:true}],
 ['hesitate',{dodge:true,decisionPause:3}],['record',{dodge:true,optional:true}],
 ['reactive',{dodge:true,rangeRoute:'reactive',timedKeeper:true}],['checkpoint-one',{cp:1,dodge:true}],
]){
 const samples=[],windows=new Map();let next=0,quiet=0,longestQuiet=0,lastElapsed=0,attacks=0,lastAttack=0;
 const outcome=traverse({...options,inspect:r=>{
  const dt=Math.max(0,r.elapsed-lastElapsed);lastElapsed=r.elapsed;if(r.joe.phase==='absent'||r.mode!=='playing')return;
  const observed=observeJoe(r),rear=observeJoe({...r,player:{...r.player,rearAngle:Math.PI}}),gap=distance(r.player,r.joe),area=district(r.player);
  if(!windows.has(area))windows.set(area,{area,seconds:0,audibleSeconds:0,visibleSeconds:0,rearVisibleSeconds:0,within8Seconds:0,minGap:Infinity,maxGap:0,stoppedSeconds:0});
  const w=windows.get(area);w.seconds+=dt;w.audibleSeconds+=observed.audible?dt:0;w.visibleSeconds+=observed.visible?dt:0;w.rearVisibleSeconds+=rear.visible?dt:0;w.within8Seconds+=gap<8?dt:0;w.minGap=Math.min(w.minGap,gap);w.maxGap=Math.max(w.maxGap,gap);w.stoppedSeconds+=r.joe.speed<.01?dt:0;
  quiet=observed.audible||observed.visible?0:quiet+dt;longestQuiet=Math.max(longestQuiet,quiet);
  if(r.joe.attackSerial!==lastAttack){attacks++;lastAttack=r.joe.attackSerial;}
  if(r.elapsed<next)return;next=r.elapsed+1;
  samples.push({seconds:r.elapsed,area,player:{x:r.player.x,y:r.player.y,yaw:r.player.yaw},joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase,speed:r.joe.speed,last:r.joe.last,evidence:r.joe.evidence,search:r.joe.search,inspectionIndex:r.joe.inspectionIndex,route:r.joe.route,wait:r.joe.waitReason},gap,audible:observed.audible,visible:observed.visible,rearVisible:rear.visible,lineClear:lineClear(r.player,r.joe),bypass:r.bypass});
 }});
 const row={name,options,outcome:{mode:outcome.mode,seconds:outcome.elapsed,waterHits:outcome.waterHits,gap:outcome.gap,evasions:outcome.evasions},attacks,longestQuiet,areas:[...windows.values()],samples};runs.push(row);console.log(JSON.stringify({...row,samples:undefined}));
}
fs.writeFileSync(`${out}/report.json`,JSON.stringify({method:'Current-source ordinary-input map-aware pilot. Audibility and forward/rear camera visibility sampled from actual states; hypothetical rear visibility does not imply a player looked. Deterministic route evidence, not human tension acceptance.',runs},null,2));
