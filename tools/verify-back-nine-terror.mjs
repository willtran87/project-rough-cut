import {terrainHeight} from '../web/course-terrain.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,distance,blocked} from '../web/back-nine-course.js';
import {BREAKABLE_PROPS,constrainMaintenanceProps,strikeWreck,advanceWreck,mowerMouthTarget} from '../web/chase-destruction.js';
import {updateShortcuts} from '../web/chase-shortcuts.js';
import {updateCourseFX} from '../web/back-nine-course-fx.js';
import {hullOverlap} from '../web/vehicle-contact.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {UTILITY_STATIONS} from '../web/chase-utility.js';
import * as THREE from '../web/vendor/three/three.module.js';
import {createDestructionArt} from '../web/chase-destruction-art.js';
const out='output/back-nine-terror-2026-11-13';fs.mkdirSync(out,{recursive:true});const checks=[];
function check(name,test){test();checks.push(name);}
check('No roadside or shelter bell stations',()=>{assert.equal(COURSE.alarms.length,0);assert.equal(UTILITY_STATIONS.length,0);});
check('Every prop blocks both player forms; only a mower strike destroys it',()=>{
 for(const [i,p]of BREAKABLE_PROPS.entries())for(const kind of ['foot','cart','mower']){
  const r=createRun(),from={x:p.x,y:p.y-6,yaw:0},actor={...from,y:p.y+1,speed:20};
  constrainMaintenanceProps(r,actor,from,kind);
  assert.equal(r.destruction.props[i].brokenAt!==null,kind==='mower');
  if(kind!=='mower'){assert(actor.y<p.y);assert.equal(actor.speed,0);}
  else {assert.equal(r.destruction.serial,1);assert.equal(r.courseFX.cue.kind,'timber');assert.equal(actor.y,p.y+1);}
 }
});
check('Near misses do not destroy props',()=>{const r=createRun(),p=BREAKABLE_PROPS[0],from={x:p.x+5,y:p.y-6,yaw:0},actor={...from,y:p.y+1,speed:30};constrainMaintenanceProps(r,actor,from,'mower');assert.equal(r.destruction.serial,0);});
check('Holding drive cannot break timber; Joe opens it and player can retreat',()=>{
 for(const foot of [false,true]){const r=createRun();r.mode='driving';const g=COURSE.hurdles[0],a=foot?(r.foot={...r.cart,onFoot:true}):r.cart,from={x:g.x,y:g.y-(foot?.5:1.8),yaw:g.yaw||0};
  for(let n=0;n<180;n++){Object.assign(a,from,{y:from.y+.1,speed:14});updateShortcuts(r,{throttle:1},1/60,from);}
  assert.equal(r.courseFX.breaks[0].age,-1);assert.equal(a.y,from.y);
  a.y=from.y-.1;updateShortcuts(r,{throttle:-1},1/60,from);assert(a.y<from.y);
  Object.assign(r.joe,{x:g.x,y:g.y,yaw:g.yaw||0,speed:12});updateCourseFX(r,1/60);assert(r.courseFX.breaks[0].age>=0);
 }
});
check('Actual mower approach shoves and crushes the abandoned cart',()=>{
 const r=createRun();r.mode='driving';r.departure.phase='finished';r.time=20;r.grace=0;
 Object.assign(r.cart,{x:0,y:95});leaveBrokenCart(r);Object.assign(r.foot,{x:0,y:108,invulnerable:999});Object.assign(r.joe,{x:0,y:88,yaw:0,speed:15});r.grace=0;r.hunt.cooldown=r.tension.cooldown=100;
 const start={...r.cart};for(let n=0;n<300;n++)updateRun(r,{},1/60);
 assert(r.wreck.hits>0);assert(r.wreck.crush>0);assert(distance(r.cart,start)>.5);assert(!blocked(r.cart,.85));
 fs.writeFileSync(out+'/wreck-live.json',JSON.stringify({hits:r.wreck.hits,crush:r.wreck.crush,displacement:distance(r.cart,start),position:r.cart,joe:r.joe},null,2));
});
check('Wreck impacts are swept; repeated impacts flatten it; a shoved cart cannot pass through the runner',()=>{
 const r=createRun();r.mode='driving';r.time=20;Object.assign(r.cart,{x:0,y:95});leaveBrokenCart(r);Object.assign(r.foot,{x:0,y:103});
 for(let i=0;i<8&&r.wreck.crush<1;i++){r.wreck.cooldown=0;const from={x:r.cart.x,y:r.cart.y-6,yaw:0};Object.assign(r.joe,from,{y:r.cart.y,speed:18});assert(strikeWreck(r,from));for(let k=0;k<30;k++)advanceWreck(r,1/60);assert(!hullOverlap(r.cart,'cart',r.foot,'foot'));}
 assert.equal(r.wreck.crush,1);assert(r.wreck.hits>=2);assert.equal(strikeWreck(r,{...r.joe}),false);
});
check('Mouth rests high and drops during active pursuit; pause freezes all destruction',()=>{
 const r=createRun();assert.equal(mowerMouthTarget(r).height,.68);r.mode='driving';r.grace=0;r.joe.mode='chase';r.joe.speed=12;assert.equal(mowerMouthTarget(r).height,.25);
 r.joe.ram.phase='backoff';assert.equal(mowerMouthTarget(r).height,.68);r.mode='paused';r.wreck.vx=5;const before=JSON.stringify(r);updateRun(r,{throttle:1},1);assert.equal(JSON.stringify(r),before);
 const fresh=createRun();assert.equal(fresh.destruction.serial,0);assert.equal(fresh.wreck.hits,0);assert.equal(fresh.checkpoint,0);assert.equal(fresh.cart.y,14);
});
check('All debris settles flat above ground, freezes, and resets on a new run',()=>{
 const scene=new THREE.Scene(),wood=new THREE.MeshBasicMaterial(),iron=new THREE.MeshBasicMaterial(),art=createDestructionArt(scene,{wood,iron}),r=createRun(),matrix=new THREE.Matrix4(),v=new THREE.Vector3();
 r.destruction.props.forEach(s=>Object.assign(s,{brokenAt:0,power:1}));r.time=2;art.update(r);
 for(const mesh of scene.children)for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);for(let c=0;c<8;c++){v.set(c&1?.5:-.5,c&2?.5:-.5,c&4?.5:-.5).applyMatrix4(matrix);const clearance=v.y-terrainHeight(v.x,-v.z);assert(clearance>=.024&&clearance<.65,`Settled debris height ${v.y}`);}}
 const before=art.stats().uploads;art.update(r);assert.equal(art.stats().uploads,before);art.update(createRun());assert.equal(art.stats().uploads,before+1);art.dispose();wood.dispose();iron.dispose();
});
fs.writeFileSync(out+'/simulation.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));


