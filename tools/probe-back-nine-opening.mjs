import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,angleDelta,clamp,distance} from '../web/back-nine-course.js';
import {scoreStage} from '../web/chase-score.js';
const rows=[];
for(const behavior of ['drive','wait','slow']){
 const r=createRun(0,0,42);r.mode='driving';let i=1,last='',firstHit=null;
 const changes=[];
 for(let f=0;f<1800&&r.mode==='driving';f++){
  const c=r.foot||r.cart;while(i<COURSE.paths[0].length-1&&distance(c,{x:COURSE.paths[0][i][0],y:COURSE.paths[0][i][1]})<7)i++;
  const t={x:COURSE.paths[0][i][0],y:COURSE.paths[0][i][1]},turn=angleDelta(Math.atan2(t.x-c.x,t.y-c.y),c.yaw);
  updateRun(r,{throttle:behavior==='wait'?0:behavior==='slow'&&c.speed>5?0:1,steer:behavior==='wait'?0:clamp(turn*2,-1,1),brake:Math.abs(turn)>.7&&c.speed>8},1/60);
  const key=[r.encounter.stage,r.encounter.owner,r.panic.phase,r.joe.ram.phase,r.hunt.phase,scoreStage(r),r.cart.hits].join('/');
  if(key!==last){changes.push({at:+r.time.toFixed(2),y:+c.y.toFixed(2),gap:+distance(c,r.joe).toFixed(2),joeSpeed:+r.joe.speed.toFixed(2),key});last=key;}if(r.cart.hits&&firstHit===null)firstHit=r.time;
 }
 rows.push({behavior,firstHit,health:r.cart.health,changes});
}
fs.mkdirSync('output/back-nine-experience/opening-pacing',{recursive:true});fs.writeFileSync('output/back-nine-experience/opening-pacing/after.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.map(r=>({...r,changes:r.changes.slice(0,12)})),null,2));
