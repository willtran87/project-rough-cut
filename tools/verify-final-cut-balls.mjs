import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave,nearbyAction} from '../web/final-cut-sim.js';
import {planChip,flightPoint,MAX_WORLD_BALLS} from '../web/final-cut-balls.js';
import {BALL_BASKETS} from '../web/final-cut-course.js';
import {traverse} from './probe-final-cut.mjs';
const checks=[],reports=[];
function fixture(){const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:16,y:42,yaw:0});r.rig.phase='disabled';return r;}
function tick(r,seconds,input={},hz=60){for(let k=0;k<Math.round(seconds*hz);k++)step(r,input,1/hz);}
function chip(r,hold=1.2,hz=60){step(r,{chipStart:true,chipHeld:true},1/hz);tick(r,hold,{chipHeld:true},hz);assert(r.ballAim.active);step(r,{chipRelease:true},1/hz);}
for(const hz of [30,60,120]){
 const r=fixture();chip(r,1.2,hz);assert.equal(r.ballCount,2);assert.equal(r.stats.balls,1);assert(!r.balls[0].landed);assert.equal(r.lure,null);
 const b=r.balls[0];assert(Math.abs(b.y-66)<.001);const end=flightPoint(b.plan,1);assert(Math.hypot(end.x-b.x,end.y-b.y,end.z-b.z)<1e-9);tick(r,1.2,{},hz);assert(b.landed);assert.equal(r.lure.source,'golf ball');
 Object.assign(r.rig,{phase:'pass',x:27,y:50,yaw:-Math.PI/2,direction:-1,deployment:1,lane:1});const serial=r.rig.passSerial;tick(r,2,{},hz);assert.equal(r.rig.lane,1);assert.equal(r.rig.passSerial,serial);assert.equal(r.rig.y,50);
 for(let k=0;k<hz*15&&!r.stats.ballRedirects;k++)step(r,{},1/hz);
 assert.equal(r.stats.ballRedirects,1);assert.equal(r.rig.lane,2);assert.equal(r.rig.evidence,'golf ball');assert.equal(r.rig.phase,'turn');assert(r.rig.path.every(p=>Math.abs(p.x)>=30));
 reports.push({hz,target:{x:b.x,y:b.y},selectedLane:r.rig.lane});
}
checks.push('30/60/120 Hz: charge/release launches once; sound begins at actual landing; current pass stays committed and the next eligible path selects the ball’s lane');
let r=fixture();const short=planChip(r,0),long=planChip(r,1);assert(long.end.y-short.end.y>17);r.player.pitch=.7;assert(planChip(r,1).end.y<long.end.y-8);r.player.pitch=0;r.player.yaw=Math.PI/2;assert(planChip(r,1).blocked);
Object.assign(r.player,{x:10,y:38,yaw:0,pitch:0});assert(planChip(r,.5).blocked);chip(r,.6);assert.equal(r.ballCount,3);assert.equal(r.stats.balls,0);assert.match(r.message,/Shot held/);
Object.assign(r.player,{x:12,y:38,yaw:Math.PI/2,pitch:0});assert(!planChip(r,.1).blocked);assert(planChip(r,1).blocked);
Object.assign(r.player,{x:17,y:38,yaw:-Math.PI/2,pitch:0});assert.equal(planChip(r,1).obstacle,'pump-roof');
checks.push('Yaw, pitch and held power change the predicted landing; actual walls, shelter roof and course boundaries reject blocked shots without spending a ball');
r=fixture();step(r,{chipStart:true,chipHeld:true});tick(r,1.3,{chipHeld:true});const cached=r.ballAim.plan;tick(r,.5,{chipHeld:true});assert.equal(r.ballAim.plan,cached);step(r,{lookX:.1,chipHeld:true});assert.notEqual(r.ballAim.plan,cached);
r=fixture();Object.assign(r.player,{x:-2,y:17.3});r.arrival.open=false;r.arrival.gate=0;step(r,{chipStart:true,chipHeld:true});tick(r,1.3,{chipHeld:true});assert(r.ballAim.plan.blocked);r.arrival.gate=1;step(r,{chipHeld:true});assert(!r.ballAim.plan.blocked);
r=fixture();Object.assign(r.player,{x:-2,y:47});step(r,{chipStart:true});assert.equal(r.ballAim.plan.obstacle,'review-board');r.broken.push('review-board');step(r);assert(!r.ballAim.plan.blocked);
checks.push('Stable full-charge previews reuse their plan; looking, sliding access gates and newly destroyed props invalidate it before release');
r=fixture();step(r,{chipStart:true,chipHeld:true});tick(r,.4,{chipHeld:true});step(r,{use:true});assert(!r.ballAim.active);assert.equal(r.ballCount,3);assert.equal(r.stats.balls,0);step(r,{chipRelease:true});assert.equal(r.stats.balls,0);
step(r,{chipStart:true,chipRelease:true});assert.equal(r.stats.balls,1);tick(r,1.3);assert(r.balls[0].landed);
const stored=readSave(JSON.stringify(snapshot(r))),restored=createRun(stored);assert.equal(restored.ballCount,2);assert.equal(restored.balls.length,1);assert(restored.balls[0].landed);assert(!restored.ballAim.active);assert.equal(restored.lure,null);
Object.assign(r.player,{x:r.balls[0].x,y:r.balls[0].y-1,yaw:0});assert.equal(nearbyAction(r)?.id,'recover-ball');step(r,{use:true});assert.equal(r.ballCount,3);assert.equal(r.balls.length,0);
checks.push('Use cancels without a shot; a fast press/release still chips once; landed balls and inventory restore without replaying sound, and real Use recovers the physical ball');
r=fixture();chip(r,.6);tick(r,.2);const flying=r.balls[0],roundtrip=createRun(readSave(JSON.stringify(snapshot(r))));assert.equal(roundtrip.ballCount,2);assert.equal(roundtrip.balls.length,1);assert(!roundtrip.balls[0].landed);assert.deepEqual(flightPoint(roundtrip.balls[0].plan,roundtrip.balls[0].age/roundtrip.balls[0].plan.duration),flightPoint(flying.plan,flying.age/flying.plan.duration));roundtrip.mode='playing';tick(roundtrip,1);assert(roundtrip.balls[0].landed);assert.equal(roundtrip.events.filter(e=>e.type==='ball-land').length,1);
checks.push('Mid-flight save/reload restores the actual parabola and elapsed flight; it lands once without duplicating or losing inventory');
r=fixture();chip(r,.6);r.won=true;r.mode='aftermath';r.message='The ground gives way. You did it.';r.messageTime=4;tick(r,1.2);assert(r.balls[0].landed);assert.equal(r.lure,null);assert.equal(r.message,'The ground gives way. You did it.');
checks.push('A late landing after machine defeat cannot overwrite victory guidance or queue a new pursuit');
for(const b of BALL_BASKETS){r=fixture();r.ballCount=0;Object.assign(r.player,{x:b.x+1,y:b.y,yaw:-Math.PI/2});assert.equal(nearbyAction(r)?.id,b.id);step(r,{use:true});assert.equal(r.ballCount,3);assert(!nearbyAction(r)?.id.startsWith('balls-'));r.ballCount=0;step(r,{use:true});assert.equal(r.ballCount,3);}
checks.push('Each physical shelter/fork basket refills empty inventory repeatedly through normal Use');
r=fixture();for(let k=0;k<25;k++){r.ballCount=3;chip(r,.2);tick(r,1.2);}assert.equal(r.balls.length,MAX_WORLD_BALLS);assert(r.balls.every(b=>b.landed));assert.equal(createRun({ballCount:-100,groundBalls:[null,{x:Infinity,y:0},{x:0,y:500}]}).ballCount,0);assert.equal(createRun({groundBalls:[null]}).balls.length,0);
checks.push('Repeated experimentation caps world balls at twelve; malformed saved inventory/positions cannot create invalid state');
for(const options of [{depleted:true},{distract:true}]){const {run}=traverse(options);assert(run.completed);assert.equal(run.captures,0);if(options.distract)assert.equal(run.stats.ballRedirects,1);else assert.equal(run.ballCount,0);reports.push({options,seconds:run.elapsed,stats:run.stats});}
checks.push('Two complete ordinary-control simulation routes: zero balls throughout, and a charged ball deliberately selected before continuing to the bell ending');
fs.mkdirSync('output/final-cut/balls',{recursive:true});fs.writeFileSync('output/final-cut/balls/rules.json',JSON.stringify({passed:true,checks,reports},null,2));console.log(JSON.stringify({passed:true,checks,reports},null,2));
