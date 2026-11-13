import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,angleDelta,clamp,distance} from '../web/back-nine-course.js';
const rows=[];
for(const seed of [0,2654435761])for(const branch of [0,3])for(const pace of [8,10,12,14]){
 let route=COURSE.paths[0];if(branch){const alt=COURSE.paths[branch],a=route.findIndex(p=>p[1]===alt[0][1]),b=route.findIndex(p=>p[1]===alt.at(-1)[1]);route=[...route.slice(0,a),...alt,...route.slice(b+1)];}
 const r=createRun(0,0,seed);r.mode='driving';let i=1,served=0,hold=0;
 for(let f=0;f<10800&&['driving','sealing'].includes(r.mode);f++){
  const c=r.foot||r.cart;while(i<route.length-1&&(distance(c,{x:route[i][0],y:route[i][1]})<(r.foot?2:7)||c.y>route[i][1]+2))i++;
  let target=c.y>788?COURSE.finish:{x:route[i][0],y:route[i][1]},service=served<2&&!r.foot&&c.y>COURSE.checkpoints[served].y-25&&c.y<COURSE.checkpoints[served].y+5;
  if(service)target=COURSE.checkpoints[served];const d=distance(c,target),delta=angleDelta(Math.atan2(target.x-c.x,target.y-c.y),c.yaw),near=distance(c,COURSE.finish)<(r.foot?1:4.5),charging=service&&d<4&&c.speed<.7;
  if(charging){hold+=1/60;if(hold>3.6){served++;hold=0;}}const desired=service?clamp((d-2)*2,0,pace):pace;
  const oldDistrict=r.hunt.lastDistrict;
  updateRun(r,r.foot?{throttle:near?0:Math.abs(delta)>1.1?0:1,steer:near?0:clamp(delta*2,-1,1),brake:near}:{throttle:near||charging||c.speed>desired?0:1,steer:charging?0:clamp(delta*2,-1,1),brake:near||charging||c.speed>desired+.3||Math.abs(delta)>.7&&c.speed>8},1/60);
  if(seed===0&&branch===3&&pace===12&&oldDistrict!=='clubhouse-pass'&&r.hunt.lastDistrict==='clubhouse-pass')fs.writeFileSync('output/back-nine-experience/opening-pacing/natural-pass.json',JSON.stringify(r));
 }
 rows.push({seed,branch,pace,mode:r.mode,health:r.cart.health,foot:!!r.foot,seconds:r.time,districts:r.events.filter(e=>e.type==='district-encounter'),passes:r.hunt.commit.passes});
}
fs.writeFileSync('output/back-nine-experience/opening-pacing/district-speeds.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
