import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,surfaceAt,runnerSurfaceAt} from '../web/back-nine-course.js';
import {irrigationPhase} from '../web/chase-irrigation.js';
import {terrainHeight,terrainSlope,contourGround,TERRAIN_FORMS} from '../web/course-terrain.js';
import * as THREE from '../web/vendor/three/three.module.js';
const checks=[];
for(const seed of [0,1,12345,4294967295]){
 const r=createRun(0,0,seed),patterns=[];
 for(let zone=0;zone<3;zone++){
  const samples=[],p=COURSE.wet[zone];let wet=0,dry=0,edges=0,prior=null;
  for(let t=0;t<180;t+=.25){r.time=t;const phase=irrigationPhase(r,zone);samples.push(+phase.active);wet+=+phase.active;dry+=+!phase.active;edges+=prior!==null&&prior!==phase.active;prior=phase.active;
   assert.equal(surfaceAt(p,r)==='wet',phase.active);assert.equal(runnerSurfaceAt(p,r)==='wet',phase.active);
   assert(phase.remaining>0&&phase.remaining<=41);
  }
  assert(wet>0&&dry>0&&edges>=6);patterns.push(samples.join(''));
 }
 assert(new Set(patterns).size===3,'Independent zones');
 r.mode='paused';const before=JSON.stringify(r),phase=irrigationPhase(r,0);for(let i=0;i<120;i++)updateRun(r,{throttle:1},1/60);assert.equal(JSON.stringify(r),before);assert.deepEqual(irrigationPhase(r,0),phase);
 const reset=createRun(0,0,seed);assert.deepEqual(irrigationPhase(reset,0),irrigationPhase(createRun(0,0,seed),0));
}
checks.push('All zones alternate wet/dry across four seeds, independently; pause and same-seed retry are deterministic');
// An active interval and dry interval at the same point must change grip.
const wet=createRun(),dry=createRun();for(const [r,on]of [[wet,true],[dry,false]]){while(irrigationPhase(r,0).active!==on)r.time+=1;r.mode='driving';r.grace=999;Object.assign(r.cart,{x:-12,y:235,yaw:0,speed:8});for(let i=0;i<12;i++)updateRun(r,{throttle:1,steer:1},1/60);}assert.equal(wet.cart.surface,'wet');assert.notEqual(dry.cart.surface,'wet');assert(wet.cart.yaw<dry.cart.yaw);checks.push('Dry grass/path restores grip, wet grass/path changes both driving and running surface');
let low=0,high=0,slope=0;
for(let y=25;y<790;y+=1.3)for(let x=-38;x<39;x+=1.7){const h=terrainHeight(x,y),s=terrainSlope(x,y,0);assert(Number.isFinite(h));low=Math.min(low,h);high=Math.max(high,h);slope=Math.max(slope,Math.abs(s.pitch),Math.abs(s.roll));}
assert(low<-.5&&high>1.3&&slope<.38);for(const f of [...COURSE.features,...COURSE.checkpoints])assert(Math.abs(terrainHeight(f.x,f.y))<1e-9);checks.push('Fifteen mounds/hollows, gentle slopes, level building and relay foundations');
const plane=new THREE.PlaneGeometry(18,35);plane.rotateX(-Math.PI/2);plane.translate(21,.01,-65);const contoured=contourGround(THREE,plane),p=contoured.attributes.position,index=contoured.index;
for(let i=0;i<index.count;i+=3){let x=0,y=0,z=0;for(let j=0;j<3;j++){const v=index.getX(i+j);x+=p.getX(v)/3;y+=p.getY(v)/3;z+=p.getZ(v)/3;}assert(Math.abs(y-terrainHeight(x,-z)-.01)<.00002,'Overlay follows the exact terrain plane');}contoured.dispose();plane.dispose();checks.push('Clipped surface triangles match terrain throughout their interiors, not just at vertices');
const baselinePath='output/back-nine-living-course/baseline-source/back-nine-sim.js',oldSource=fs.readFileSync(baselinePath,'utf8').replace(/from '([^']+)'/g,(_,p)=>`from '${new URL('../web/'+p,import.meta.url).href}'`),old=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
function pursuit(sim,foot){const r=sim.createRun(1,0,12345);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.hunt.cooldown=r.tension.cooldown=100;Object.assign(r.cart,{x:0,y:320,yaw:0,speed:14});Object.assign(r.joe,{x:0,y:280,yaw:0,speed:0});if(foot){r.cart.health=0;r.cart.x=r.cart.y=30;r.foot={x:0,y:320,yaw:0,viewYaw:0,speed:7,onFoot:true,invulnerable:0};}for(let i=0;i<60;i++)sim.updateRun(r,{throttle:1},1/60);return {advance:r.joe.y-280,plans:r.joe.plans};}
const current={createRun,updateRun},paired={cart:{before:pursuit(old,false),after:pursuit(current,false)},foot:{before:pursuit(old,true),after:pursuit(current,true)}};for(const p of Object.values(paired)){assert(p.after.advance>p.before.advance*1.08);assert(p.after.plans>=p.before.plans);}checks.push('Joe closes faster than the immediately previous build in both pursuit modes');
const report={passed:true,checks,terrain:{forms:TERRAIN_FORMS.length,low,high,maxSlope:slope},paired};fs.writeFileSync('output/back-nine-living-course/physics.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
