import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {pursuitCatchup,trimPursuitRoute,cornerSpeed} from '../web/mower-pursuit.js';
import {updateHunt} from '../web/back-nine-hunt.js';
import {updatePressure} from '../web/chase-pressure.js';
import {COURSE,distance,lineClear,planMowerRoute} from '../web/back-nine-course.js';
import {vehicleOverlap} from '../web/vehicle-contact.js';
const make=()=>{const r=createRun();r.mode='driving';r.grace=0;return r;};
const checks=[],check=(name,f)=>{f();checks.push(name);};
let shadowDistance=0,minGap=Infinity;
check('Checkpoint protection follows at a safe distance without damage or new attacks',()=>{
 const r=make();Object.assign(r.cart,{x:0,y:294,speed:14});Object.assign(r.joe,{x:0,y:273,speed:18});r.joe.ram.armed=true;const origin={...r.joe};
 for(let f=0;f<145;f++){updateRun(r,{throttle:1},1/60);assert.equal(r.checkpoint,1);assert(r.grace>0);assert.equal(r.cart.hits,0);assert(!r.joe.ram.armed);assert.equal(r.joe.ram.phase,'none');assert(!vehicleOverlap(r.cart,r.joe));minGap=Math.min(minGap,distance(r.cart,r.joe));}
 shadowDistance=distance(origin,r.joe);assert(shadowDistance>20);assert(minGap>=10.9);
 // Braking during protection cannot make the following mower pin the cart.
 r.grace=2;r.checkpointGrace=2;r.cart.speed=0;for(let f=0;f<100;f++){updateRun(r,{brake:true},1/60);assert.equal(r.cart.hits,0);assert(distance(r.cart,r.joe)>10.9);}
 const start=createRun();start.mode='driving';const y=start.joe.y;updateRun(start,{throttle:1},1/60);assert.equal(start.joe.y,y,'Initial start grace stays still');
});
check('Catch-up fades before close contact and respects visibility, cover, protection and diversions',()=>{
 const r=make();r.cart.y=60;r.joe.y=3;assert.equal(pursuitCatchup(r,true,57),1);assert.equal(pursuitCatchup(r,true,30),0);assert.equal(pursuitCatchup(r,false,57),0);
 r.hunt.lastVisual={x:0,y:60};r.hunt.lastVisualAge=1;const value=pursuitCatchup(r,false,57);r.cart.x=37;r.cart.y=740;assert.equal(pursuitCatchup(r,false,700),value,'Hidden position does not supply distance');r.hunt.lastVisualAge=2;assert.equal(pursuitCatchup(r,false,57),0);
 for(const kind of ['foot','grace','invulnerable','alarm','opening','sealing']){const s=make();s.cart.y=60;if(kind==='foot')s.foot={};else if(kind==='grace')s.grace=1;else if(kind==='invulnerable')s.cart.invulnerable=1;else if(kind==='alarm')s.decoys.active=0;else if(kind==='opening')s.pressure.phase='opening';else s.mode='sealing';assert.equal(pursuitCatchup(s,true,60),0,kind);}
});
check('Look-ahead removes clear grid steps but never cuts through obstacles or mower-blocking gates',()=>{
 const j={x:0,y:20,speed:24,route:[{x:0,y:24},{x:0,y:28},{x:0,y:32},{x:0,y:50}]};trimPursuitRoute(j);assert.equal(j.route[0].y,32);
 const pairs=[[{x:4,y:770},{x:4,y:820}],...COURSE.shortcuts.map(s=>[{x:s.x-Math.sin(s.yaw)*9,y:s.y-Math.cos(s.yaw)*9},{x:s.x+Math.sin(s.yaw)*9,y:s.y+Math.cos(s.yaw)*9}])];
 for(const [from,to]of pairs){const r={...from,speed:28,route:planMowerRoute(from,to).points};trimPursuitRoute(r);assert(r.route.length);assert(lineClear(from,r.route[0],1.65));}
 assert(cornerSpeed({x:0,y:0,route:[{x:0,y:4},{x:10,y:4}]},24)<10);
});
check('Obsolete visible interception releases promptly; hidden prediction remains fixed',()=>{
 for(const visible of [false,true]){const r=make();r.cart.hits=1;Object.assign(r.cart,{x:0,y:180,speed:14});Object.assign(r.joe,{x:0,y:120});Object.assign(r.hunt,{phase:'intercept',age:2,cursor:1,waypoints:[{x:-10,y:130},{x:0,y:150}]});const targets=JSON.stringify(r.hunt.waypoints);updateHunt(r,1/60,visible);if(visible)assert.equal(r.hunt.phase,'follow');else{assert.equal(r.hunt.phase,'intercept');assert.equal(JSON.stringify(r.hunt.waypoints),targets);}}
});
check('Checkpoint and impact relief consume stale missed attacks instead of stacking another opening',()=>{
 const r=make();r.cart.speed=14;r.cart.y=80;r.joe.y=20;r.panic.serial=1;r.pressure.waves=1;r.joe.ram.launches=2;r.cart.invulnerable=1;updatePressure(r,1/60,true);assert.equal(r.pressure.missedLaunch,2);r.cart.invulnerable=0;r.pressure.launchAge=8;r.hunt.phase='commit_recover';updatePressure(r,1/60,true);assert.notEqual(r.pressure.phase,'opening');assert(r.pressure.reliefCooldown>3);
});
fs.mkdirSync('output/pursuit-continuity',{recursive:true});fs.writeFileSync('output/pursuit-continuity/boundaries.json',JSON.stringify({passed:true,checks,shadowDistance,minGap},null,2));console.log(JSON.stringify({passed:true,checks,shadowDistance,minGap}));
