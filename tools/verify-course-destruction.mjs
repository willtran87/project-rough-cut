import assert from 'node:assert/strict';
import fs from 'node:fs';
import {COURSE,distance,planMowerRoute} from '../web/back-nine-course.js';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {isDestructibleFeature,featureBroken} from '../web/course-destruction-state.js';
import {constrainFeatureMotion,hullOverlap} from '../web/vehicle-contact.js';
import {cartShoveClear} from '../web/cart-impact.js';
import {ejectionPathClear} from '../web/chase-ejection-clearance.js';
import {runnerCameraFraction} from '../web/runner-camera.js';
const features=COURSE.features.filter(isDestructibleFeature),results=[];
for(const f of features){
 const r=createRun();r.mode='driving';r.time=10;
 // Narrow windbreak ends can adjoin permanent buildings. Approach their
 // exposed span, rather than asking a wide mower to overlap that building.
 const candidates=[1,-1].flatMap(direction=>[0,-.65,.65,-.9,.9].map(offset=>({x:f.x+f.rx*offset,y:f.y,direction})));
 const point=candidates.find(p=>{const state=createRun(),from={x:p.x,y:p.y-(f.ry+4)*p.direction,yaw:p.direction===1?0:Math.PI},to={...p,yaw:from.yaw,speed:18};constrainFeatureMotion(to,from,'mower',state);return featureBroken(state,f)&&cartShoveClear({...p,yaw:0},{x:35,y:10,yaw:0},state)&&ejectionPathClear(from,p,.32,state);});
 assert(point,`Exposed drive-through approach: ${f.id}`);
 const from={x:point.x,y:point.y-(f.ry+4)*point.direction,yaw:point.direction===1?0:Math.PI},to={...point,speed:18,yaw:from.yaw};
 for(const kind of ['cart','foot']){const player={...to};assert(constrainFeatureMotion(player,from,kind,r));assert(!featureBroken(r,f));assert(!hullOverlap(player,kind,f,'feature'));}
 assert(runnerCameraFraction(from,to,r)<1);assert(!ejectionPathClear(from,to,.32,r));assert(!cartShoveClear(to,{x:35,y:10,yaw:0},r));
 const joe={...to};constrainFeatureMotion(joe,from,'mower',r);assert(featureBroken(r,f),f.id);assert.equal(r.events.filter(e=>e.id===f.id).length,1);
 const player={...to};constrainFeatureMotion(player,from,'cart',r);assert(distance(player,to)<.001,`Opened gap: ${f.id}`);
 assert.equal(runnerCameraFraction(from,to,r),1);assert(ejectionPathClear(from,to,.32,r),`Ejection gap: ${f.id}`);assert(cartShoveClear(to,{x:35,y:10,yaw:0},r));
 constrainFeatureMotion({...to},from,'mower',r);assert.equal(r.events.filter(e=>e.id===f.id).length,1);
 const reset=createRun();assert(!featureBroken(reset,f));results.push(f.id);
}
// Joe's actual pursuit must choose the drive-through line and smash a cart.
const f=features.find(f=>f.kind==='parked-cart'),r=createRun();r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.hunt.cooldown=r.tension.cooldown=100;
Object.assign(r.joe,{x:f.x,y:f.y-8,yaw:0,speed:15});Object.assign(r.cart,{x:f.x,y:f.y+12,yaw:0,speed:0,invulnerable:100});
const route=planMowerRoute(r.joe,r.cart);assert.equal(route.points.length,1,'Joe no longer detours around the parked cart');
for(let i=0;i<180;i++)updateRun(r,{},1/60);assert(featureBroken(r,f));assert(r.joe.y>f.y+f.ry,'Joe drives beyond the broken obstacle');
const frozen=JSON.stringify(r);r.mode='paused';const paused=JSON.stringify(r);for(let i=0;i<30;i++)updateRun(r,{},1/60);assert.equal(JSON.stringify(r),paused);assert.notEqual(paused,frozen);
const result={passed:true,features:results,livePursuit:{broken:f.id,joeY:r.joe.y,events:r.events.filter(e=>e.type==='joe-destruction')}};
fs.mkdirSync('output/back-nine-destruction-expanded',{recursive:true});fs.writeFileSync('output/back-nine-destruction-expanded/physics.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
