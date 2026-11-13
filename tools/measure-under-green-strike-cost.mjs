import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {settleWeapon as after} from '../web/under-green-clearance.js';
import {createRun} from '../web/under-green-sim.js';
const source=fs.readFileSync('output/under-green/visual-upgrade/pass26-source/under-green-clearance.js','utf8').replace(/from '(\.\/[^']+)'/g,(_,s)=>`from '${pathToFileURL(process.cwd()+'/web/'+s.slice(2)).href}'`);
const {settleWeapon:before}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const rows=[];
for(const fixture of ['open','wall','root'])for(const [name,fn]of [['before',before],['after',after]]){
 const times=[];
 for(let cycle=0;cycle<12;cycle++){
  const r=createRun();Object.assign(r.joe,fixture==='root'?{x:-1.8,y:16.4,yaw:Math.PI}:fixture==='wall'?{x:1.5,y:50,yaw:.8}:{x:0,y:50,yaw:0},{phase:'walk',age:0});fn(r,1/60);
  for(const [phase,duration]of [['windup',.95],['sweep',.22],['recover',1.3]])for(let i=0;i<Math.ceil(duration*60);i++){
   r.joe.phase=phase;r.joe.age=i/60;r.time+=1/60;const t=performance.now();fn(r,1/60);if(cycle>1)times.push(performance.now()-t);
  }
 }
 times.sort((a,b)=>a-b);rows.push({fixture,name,samples:times.length,medianMs:times[Math.floor(times.length*.5)],p95Ms:times[Math.floor(times.length*.95)]});
}
const report={scope:'Node settleWeapon CPU microbenchmark; not browser frame-time acceptance. Scripted phases include repeated near-surface queries.',rows};
fs.writeFileSync('output/under-green/visual-upgrade/pass26-source/final-settle-timing.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
