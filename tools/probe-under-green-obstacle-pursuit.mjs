import fs from 'node:fs';
import {createRun,step} from '../web/under-green-sim.js';
import {OBSTACLES,solid,sightClear,distance,WATERS,inWater} from '../web/under-green-course.js';
import {weaponClear,settleWeapon} from '../web/under-green-clearance.js';
const out='output/under-green/obstacle-pursuit';fs.mkdirSync(out,{recursive:true});const rows=[],stalls=[];
for(const o of OBSTACLES.filter(o=>['pump-buttress','pump-machine','pump-control','root-pillar','range-island'].includes(o.id))){
 for(const [dx,dy]of [[-1,-1],[-1,1],[1,-1],[1,1]]){
  const p={x:o.x+dx*(o.w/2+.5),y:o.y+dy*(o.d/2+.5)};
  for(const offset of [{x:0,y:6},{x:6,y:0},{x:0,y:-6},{x:-6,y:0}]){
   const j={x:p.x+offset.x,y:p.y+offset.y};
   if(solid(p,.3)||solid(j,.8)||!sightClear(j,p)||WATERS.some(w=>inWater(p,w,.4)||inWater(j,w,.8)))continue;
   const r=createRun(2);r.mode='playing';r.time=50;Object.assign(r.player,p,{grace:0});Object.assign(r.joe,j,{yaw:Math.atan2(p.x-j.x,p.y-j.y),phase:'walk',last:{...p}});settleWeapon(r,1/60);
   if(!weaponClear(r.joe))continue;
   const initial=structuredClone(r);let still=0,maxStill=0;
   for(let n=0;n<1200&&r.mode==='playing';n++){
    const old={...r.joe};step(r);still=r.joe.seen&&distance(old,r.joe)<.0001&&!['windup','sweep','recover'].includes(r.joe.phase)?still+1/60:0;maxStill=Math.max(maxStill,still);
   }
   const row={obstacle:o.id,p,j,mode:r.mode,seconds:r.elapsed,phase:r.joe.phase,gap:distance(r.player,r.joe),maxStill,seen:r.joe.seen};rows.push(row);
   if(r.mode==='playing'){stalls.push({row,initial,final:r});console.log(JSON.stringify(row));}
  }
 }
 console.log(JSON.stringify({obstacle:o.id,cases:rows.length,unfinished:stalls.length}));
}
fs.writeFileSync(out+'/report.json',JSON.stringify({rows,stalls},null,2));console.log(JSON.stringify({cases:rows.length,unfinished:stalls.length}));
