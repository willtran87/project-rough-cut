import assert from 'node:assert/strict';
import fs from 'node:fs';
import {leaveBrokenCart} from '../web/chase-player.js';
import {ejectionPathClear} from '../web/chase-ejection-clearance.js';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,distance} from '../web/back-nine-course.js';
import {updateShortcuts,GATE_UNLATCH_SECONDS,shortcutCaption} from '../web/chase-shortcuts.js';
import {updateCourseFX} from '../web/back-nine-course-fx.js';
import {barrierFootprint,barrierPiecePose} from '../web/chase-barriers.js';
import {hullOverlap} from '../web/vehicle-contact.js';
import {terrainHeight} from '../web/course-terrain.js';
import * as THREE from '../web/vendor/three/three.module.js';
import {createCourseHurdles} from '../web/course-hurdles.js';
const out='output/back-nine-experience/manual-gates';fs.mkdirSync(out,{recursive:true});
const gates=COURSE.hurdles.map((g,i)=>({g,i})).filter(({g})=>g.shortcut!==undefined),rows=[];
function make(g,foot,direction=1){const r=createRun(0,0,37161);r.mode='driving';r.time=20;r.grace=999;r.departure.phase='finished';r.hunt.cooldown=r.tension.cooldown=100;r.tension.zoneMask=7;
 const yaw=g.yaw+(direction<0?Math.PI:0),a={x:g.x-Math.sin(yaw)*3,y:g.y-Math.cos(yaw)*3,yaw,viewYaw:yaw,speed:0,onFoot:foot,invulnerable:0};
 if(foot){r.foot=a;Object.assign(r.cart,{x:38,y:20,health:0,failedAt:0});}else Object.assign(r.cart,a);Object.assign(r.joe,{x:38,y:5,speed:0});return r;}
function step(r,input,seconds,fps=60){for(let n=0;n<Math.round(seconds*fps);n++)for(let k=0;k<Math.ceil(30/fps);k++)updateRun(r,input,1/fps/Math.ceil(30/fps));}
for(const {g,i}of gates)for(const foot of [false,true])for(const direction of [-1,1])for(const fps of [15,60]){
 const r=make(g,foot,direction),a=r.foot||r.cart,s=r.courseFX.breaks[i];step(r,{brake:true},.5,fps);assert(s.press>0&&!s.unlatched);step(r,{},.1,fps);assert.equal(s.press,0,'Release cancels the unlatch, with no consumed gate');
 step(r,{brake:true},2.1,fps);assert.equal(s.open,1,JSON.stringify({g,foot,direction,s,a}));assert(s.unlatched);assert.equal(s.age,-1,'Opening is not destruction');assert.equal(r.events.filter(e=>e.type==='gate-unlatched').length,1);assert.equal(s.swingDirection,-direction);
 const yaw=g.yaw+(direction<0?Math.PI:0);step(r,{throttle:1},2.5,fps);const progress=(a.x-g.x)*Math.sin(yaw)+(a.y-g.y)*Math.cos(yaw);assert(progress>3,JSON.stringify({g,foot,direction,progress,a,s}));assert(!hullOverlap(a,foot?'foot':'cart',barrierFootprint(g,s),'feature'));rows.push({shortcut:g.id,foot,direction,fps,progress,health:r.cart.health,open:s.open});
}
for(const {g,i}of gates){
 const r=make(g,false),s=r.courseFX.breaks[i];step(r,{throttle:1},2);assert.equal(s.age,-1);assert(!s.unlatched,'Accelerating into the timber cannot open or smash it');const before={...r.cart};step(r,{throttle:-1},1);assert(distance(r.cart,g)>distance(before,g),'Backing clear remains available');
 const frozen=JSON.stringify(r);r.mode='paused';const paused=JSON.stringify(r);updateRun(r,{brake:true},1);assert.equal(JSON.stringify(r),paused);assert.notEqual(frozen,paused);
 for(const open of [0,.25,.5,.75,1]){const z=make(g,false),state=z.courseFX.breaks[i];Object.assign(state,{unlatched:true,open,swingDirection:-1});const shape=barrierFootprint(g,state);Object.assign(z.joe,{x:shape.x,y:shape.y,yaw:shape.yaw,speed:12});updateCourseFX(z,1/60);assert.equal(state.age,0,'Actual deck overlap breaks a gate at its current angle');assert.equal(z.courseFX.cue.kind,'timber');}
}
// Opening cannot sweep through a standing runner or the mower, and resumes
// only once the obstruction is physically gone. No displacement/invulnerability.
{
 const {g,i}=gates[0],r=make(g,true),s=r.courseFX.breaks[i];Object.assign(s,{unlatched:true,open:.35,swingDirection:-1});const future=barrierFootprint(g,{...s,open:.45});Object.assign(r.foot,{x:future.x,y:future.y});const before={...r.foot};updateShortcuts(r,{},.2,{...r.foot});assert(s.swingBlocked&&s.open<.45);assert.equal(r.foot.x,before.x);assert.equal(r.foot.y,before.y);
 Object.assign(r.foot,{x:g.x,y:g.y-5});step(r,{},1);assert.equal(s.open,1);
}
let landings=0;
for(const {g,i}of gates)for(const open of [0,.25,.5,.75,1])for(const direction of [-1,1]){
 const r=make(g,true,direction),s=r.courseFX.breaks[i];Object.assign(s,{open,unlatched:true,swingDirection:-direction});const shape=barrierFootprint(g,s),a=r.foot;
 Object.assign(a,{x:shape.x,y:shape.y,speed:1});const from={...a};a.x+=Math.sin(shape.yaw)*.15;a.y+=Math.cos(shape.yaw)*.15;updateShortcuts(r,{},0,from);assert(distance(a,from)>.1,'A displaced runner can back out of leaf overlap');
 assert(!ejectionPathClear({x:g.x,y:g.y-5},shape,.32,r),'No landing inside the current leaf');
 const z=make(g,false,direction);Object.assign(z.courseFX.breaks[i],{open,unlatched:true,swingDirection:-direction});z.cart.health=0;leaveBrokenCart(z);assert(z.foot);assert(!hullOverlap(z.foot,'foot',shape,'feature'),'Ejected runner lands clear of the current gate angle');landings++;
}
// The animated wood fits the rotating physical footprint throughout the swing.
const scene=new THREE.Scene(),geo=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshBasicMaterial(),art=createCourseHurdles(scene,COURSE.hurdles,geo,material),r=createRun(),matrix=new THREE.Matrix4(),v=new THREE.Vector3();let poses=0;
for(const {g,i}of gates)for(const direction of [-1,1])for(let k=0;k<=20;k++){
 Object.assign(r.courseFX.breaks[i],{open:k/20,swingDirection:direction,age:-1});const shape=barrierFootprint(g,r.courseFX.breaks[i]);art.update(r);const sn=Math.sin(shape.yaw),cs=Math.cos(shape.yaw);
 for(let part=0;part<6;part++){art.mesh.getMatrixAt(i*6+part,matrix);for(let n=0;n<8;n++){v.set(n&1?.5:-.5,n&2?.5:-.5,n&4?.5:-.5).applyMatrix4(matrix);const dx=v.x-shape.x,dy=-v.z-shape.y;assert(Math.abs(dx*cs-dy*sn)<=shape.rx+.03);assert(Math.abs(dx*sn+dy*cs)<=shape.ry+.01);assert(v.y>terrainHeight(v.x,-v.z)-.02);}}
 art.update(r);assert.equal(art.stats().uploads,0,'Settled same-state gates do not stream matrices');poses++;
}
art.update(createRun());assert.equal(art.stats().uploads,18,'Only the three changed gate poses need reset uploads');art.dispose();geo.dispose();material.dispose();
assert.equal(COURSE.alarms.length,0);assert(createRun().courseFX.breaks.every(s=>!s.unlatched&&s.open===0&&s.age===-1));
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,crossings:rows,poses,landings,checks:['hold/release','both directions/cart/foot/15/60Hz','no collision destruction by player','mower current-angle destruction','obstruction waits','pause/reset','same-state upload cache','no bells']},null,2));console.log(JSON.stringify({passed:true,crossings:rows.length,poses,landings}));
