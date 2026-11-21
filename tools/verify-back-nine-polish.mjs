// Polish-pass rules for the Back Nine: difficulty leaves Standard untouched and
// moves Relaxed/Hard in the stated direction, the Use ring mirrors the sim's
// own hold conditions, discoveries come from logged evidence, rumble follows
// run events, and the presentation helpers stay inside their envelopes.
import assert from 'node:assert/strict';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {scaledImpactDamage} from '../web/ram-damage.js';
import {COURSE} from '../web/back-nine-course.js';
import {applyDifficulty,DIFFICULTY,holdState,discoveriesIn,DISCOVERIES,runStats,createRumbleFeedback,loadingFraction} from '../web/back-nine-polish.js';
import {createCartMotionState,stepCartMotion,CART_STEER_LOCK} from '../web/back-nine-cart-motion.js';
import {tyreMarkStrength} from '../web/back-nine-tyre-marks.js';
import {frogPlacement,tyreVoice} from '../web/back-nine-air-audio.js';

const checks=[];
function drive(run,seconds,input=()=>({throttle:1,steer:0})){run.mode='driving';for(let i=0;i<seconds*60;i++)updateRun(run,input(i),1/60);return run;}
const digest=run=>JSON.stringify([run.time,run.cart,run.joe.x,run.joe.y,run.joe.yaw,run.joe.speed,run.events.length,run.impact]);

// Standard carries no record and replays identically; setting and clearing a
// difficulty before the first step leaves no trace.
{
 const plain=drive(createRun(0,0,4242),40),same=createRun(0,0,4242);
 assert.equal(applyDifficulty(same,'standard'),'standard');assert.equal('difficulty' in same,false);
 applyDifficulty(same,'hard');assert.equal(same.difficulty.name,'hard');applyDifficulty(same,'standard');assert.equal('difficulty' in same,false);
 assert.equal(digest(drive(same,40)),digest(plain));
 const late=drive(createRun(0,0,4242),1);assert.equal(applyDifficulty(late,'hard'),'standard','difficulty cannot change after the run has begun');
 checks.push('Standard is unchanged and difficulty is fixed once a run starts');
}
// Relaxed and Hard: explicit multipliers only.
{
 assert.equal(scaledImpactDamage(.8,null,1),scaledImpactDamage(.8,{cart:{y:0},checkpoint:0},1));
 const at=name=>{const r=createRun(0,0,7);applyDifficulty(r,name);r.cart.y=700;r.checkpoint=2;return scaledImpactDamage(.8,r,1);};
 assert(at('relaxed')<at('standard')&&at('standard')<at('hard'),'ram damage orders relaxed < standard < hard');
 // Open pursuit down a straight path from the same placement: only the
 // multiplier differs, so Joe's travel orders with the difficulty.
 const travel=name=>{const r=createRun(0,0,4242);r.mode='driving';r.grace=0;r.departure.phase='finished';applyDifficulty(r,name);r.time=30;Object.assign(r.cart,{x:0,y:140,speed:9});Object.assign(r.joe,{x:0,y:95,speed:8,mode:'pursuit'});
  let d=0,x=r.joe.x,y=r.joe.y;for(let i=0;i<240;i++){updateRun(r,{throttle:1,steer:0},1/60);d+=Math.hypot(r.joe.x-x,r.joe.y-y);x=r.joe.x;y=r.joe.y;}return d;};
 const relaxed=travel('relaxed'),standard=travel('standard'),hard=travel('hard');
 assert(relaxed<standard&&standard<hard,`Joe covers less ground on Relaxed (${relaxed.toFixed(1)}) than Standard (${standard.toFixed(1)}) than Hard (${hard.toFixed(1)})`);
 assert.equal(DIFFICULTY.hard.checkpoints,false);assert.equal(DIFFICULTY.standard.checkpoints,false);assert.equal(DIFFICULTY.relaxed.checkpoints,true);
 checks.push('Relaxed and Hard scale ram damage and pursuit speed in the stated direction');
}
// Use ring.
{
 const r=createRun(0,0,1);r.mode='driving';assert.equal(holdState(r).available,false);
 Object.assign(r.cart,{x:COURSE.checkpoints[0].x,y:COURSE.checkpoints[0].y-1,speed:0});r.grace=0;
 updateRun(r,{use:false},1/60);assert.equal(holdState(r).available,true);assert.equal(holdState(r).label,'Crew log');
 for(let i=0;i<30;i++)updateRun(r,{use:true},1/60);const held=holdState(r);assert(held.ratio>.3&&held.ratio<.6,'ring follows the crew-log hold');
 for(let i=0;i<60;i++)updateRun(r,{use:true},1/60);assert.equal(r.story.collected&1,1);
 assert(discoveriesIn(r).includes('crew-log-0'));
 r.mode='paused';assert.equal(holdState(r).available,false);
 checks.push('Use ring mirrors the simulation hold and hides outside play');
}
// Discoveries and summary rows.
{
 const r=createRun(0,0,1);r.events.push({type:'gate-unlatched',time:1},{type:'course-tactic',id:'east-flush',time:2},{type:'complete',time:3});r.experience.nearMiss.serial=3;
 const found=discoveriesIn(r);for(const id of ['gate','flood','clean','close-shave'])assert(found.includes(id),id);
 for(const id of found)assert(DISCOVERIES.some(d=>d.id===id),id);
 assert.deepEqual(discoveriesIn(r,3).filter(id=>id!=='close-shave'),[]);
 r.time=100;r.escape={kind:'running-cart'};const stats=runStats(r,{carriedSeconds:50,carriedCalls:2,retries:1});
 assert.equal(stats.seconds,150);assert.equal(stats.closeCalls,5);assert.equal(stats.extras['Relay retries'],1);assert.equal(stats.difficulty,'standard');
 checks.push('Discoveries come from logged evidence; a relay retry carries time and close calls');
}
// Rumble.
{
 const played=[],rumble={pulse:(pad,o)=>{played.push(o.kind);return true;},hum:(pad,amount)=>{if(amount>.02)played.push('hum');return amount>.02;},stop(){}};
 const present=createRumbleFeedback(rumble),r=createRun(0,0,1);r.mode='driving';const pad={};
 assert.equal(present(r,null),'');present(r,pad);played.length=0;
 r.impact={serial:1,age:0,strength:.8,damaged:true};assert.equal(present(r,pad),'impact');assert.equal(present(r,pad)==='impact',false,'one pulse per impact');
 r.experience.nearMiss.serial=1;present(r,pad);assert(played.includes('near-miss'));
 r.cart.speed=9;r.cart.surface='rough';played.length=0;present(r,pad);assert(played.includes('hum'));
 r.checkpoint=1;present(r,pad);assert(played.includes('relay'));
 checks.push('Rumble follows impacts, near misses, relays and ground texture');
}
// Cart suspension: bounded, settles, steers the front wheels, still under Reduced motion.
{
 const s=createCartMotionState(),run={cart:{speed:0,yaw:0,steer:0},foot:null};stepCartMotion(s,run,1/60);
 let peak=0;for(let i=0;i<60;i++){run.cart.speed=Math.min(10,run.cart.speed+9/60);stepCartMotion(s,run,1/60,{rough:1});peak=Math.max(peak,Math.abs(s.pitch));}
 assert(peak>.004&&peak<=.03,'squat is visible and bounded: '+peak);
 for(let i=0;i<120;i++)stepCartMotion(s,run,1/60);assert(Math.abs(s.pitch)<.001,'pitch settles');
 run.cart.steer=1;for(let i=0;i<60;i++)stepCartMotion(s,run,1/60);assert(s.steer>.15&&s.steer<=CART_STEER_LOCK);
 const calm=createCartMotionState();stepCartMotion(calm,run,1/60);run.cart.speed=0;stepCartMotion(calm,run,1/60,{reducedMotion:true,rough:1});assert.equal(calm.pitch,0);assert.equal(Math.max(...calm.bounce),0);
 checks.push('Cart suspension is bounded, settles and is still under Reduced motion');
}
// Tyre marks, tyre sound, frogs, loading bar.
{
 assert.equal(tyreMarkStrength('path',9,0,0),0);assert(tyreMarkStrength('path',6,0,9)>0);assert(tyreMarkStrength('sand',5,0,0)===1);assert.equal(tyreMarkStrength('rough',.5,0,0),0);
 assert(tyreVoice('rough',8).hz<tyreVoice('path',8).hz&&tyreVoice('path',8).hz<tyreVoice('wet',8).hz);assert.equal(tyreVoice('path',0).gain,0);
 const water=COURSE.wet[0],near=frogPlacement({x:water.x+8,y:water.y},{x:0,y:0},0),scared=frogPlacement({x:water.x+8,y:water.y},{x:water.x,y:water.y-5},0),far=frogPlacement({x:0,y:20},{x:0,y:0},0);
 assert(near.gain>.5);assert.equal(scared.gain,0);assert.equal(far.gain,0);assert(near.pan<0,'water to the left is heard on the left');
 let v=0;for(const [m,t]of [['',1],['Laying out the back nine…',1],['Preparing the cart and the mower…',3],['Preparing course details…',2],['Preparing course details…',30]]){const next=loadingFraction(m,v,t);assert(next>=v&&next<=1);v=next;}
 assert(v>.9);
 checks.push('Tyre marks, tyre sound, frogs and the loading bar follow their rules');
}
console.log(JSON.stringify({passed:true,checks},null,1));
