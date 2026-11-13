import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {hullOverlap,constrainVehicleMotion} from '../web/vehicle-contact.js';
const out='output/back-nine-experience/foot-clearance';
const oldSource=fs.readFileSync(out+'/baseline-source/vehicle-contact.js','utf8').replace("'./back-nine-course.js'",JSON.stringify(pathToFileURL(process.cwd()+'/web/back-nine-course.js').href));
const old=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
let invariants=0,vehicleCases=0;
for(const kind of ['cart','mower','feature'])for(const targetYaw of [0,.7,1.6,3.1])for(const p of [{x:2.2,y:1.3},{x:.2,y:.3},{x:4,y:2}]){
 const other={x:0,y:0,yaw:targetYaw,rx:2,ry:.8};const expected=hullOverlap({...p,yaw:0},'foot',other,kind);
 for(let degree=0;degree<360;degree++){
  const foot={...p,yaw:degree*Math.PI/180};assert.deepEqual(hullOverlap(foot,'foot',other,kind),expected,'Facing cannot change a standing runner collision');
  if(kind!=='feature'){const swapped=hullOverlap(other,kind,foot,'foot');assert.equal(!!swapped,!!expected);if(expected){assert(Math.abs(swapped.depth-expected.depth)<1e-10);assert(Math.hypot(swapped.x+expected.x,swapped.y+expected.y)<1e-10);}}
  invariants++;
 }
}
for(let i=0;i<8000;i++){
 const a={x:Math.sin(i*1.37)*5,y:30+Math.cos(i*.31)*5,yaw:i*.13,speed:8},b={x:0,y:30,yaw:i*.37,rx:2.5,ry:3.2},kind=i%2?'mower':'cart',other=i%3?'mower':'feature';
 assert.deepEqual(hullOverlap(a,kind,b,other),old.hullOverlap(a,kind,b,other),'Vehicle hulls remain exact');
 const from={...a},target={...a,x:a.x+.12,y:a.y+.18,yaw:a.yaw+.02},baseline={...target};
 assert.equal(constrainVehicleMotion(target,from,b,kind,other),old.constrainVehicleMotion(baseline,from,b,kind,other));assert.deepEqual(target,baseline);vehicleCases++;
}
// A runner next to a fence can turn without gaining width, and a fast sweep
// still stops on the near side of both a thin fence and the mower's deck.
for(const [other,kind] of [[{x:0,y:0,rx:5,ry:.22},'feature'],[{x:0,y:0,yaw:0},'mower'],[{x:0,y:0,yaw:.8},'cart']])for(const yaw of [0,.3,Math.PI/2,Math.PI]){
 const from={x:0,y:-4,yaw},target={x:0,y:4,yaw,speed:8};assert(constrainVehicleMotion(target,from,other,'foot',kind));assert(!hullOverlap(target,'foot',other,kind));assert(target.y<0);
}
const report={passed:true,headingInvariants:invariants,unchangedVehicleCases:vehicleCases,fastSweeps:12};fs.writeFileSync(out+'/footprint.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
