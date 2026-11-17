// The flood-and-bait loop: four floodable basins, one at a time, with water
// that drains. Two holds in the fairway hollows unlock the nursery swale, and
// only the swale ends the round.
import assert from 'node:assert/strict';
import {createRun,step,snapshot,readSave,nearbyAction,objective,threat} from '../web/final-cut-sim.js';
import {BASINS,BASIN_TIMING as T,BREAKER,BLACKOUT} from '../web/final-cut-basin-layout.js';
import {valveState,openValve,basinById,stageOf,swaleArmed,lightsDown} from '../web/final-cut-basins.js';
import {seesPlayer} from '../web/final-cut-ambush.js';
import {courseLightState} from '../web/final-cut-reveal.js';
import {BELL,refuge} from '../web/final-cut-course.js';
import {finaleOutcome} from '../web/final-cut-outcome.js';

const checks=[],dt=1/60;
const wait=(r,seconds,input={})=>{for(let t=0;t<seconds&&['playing','aftermath'].includes(r.mode);t+=dt)step(r,input,dt);};
const fresh=()=>{const r=createRun({checkpoint:1,openingSeen:true});r.mode='playing';Object.assign(r.player,{x:10,y:38});return r;};
const near=basinById('near'),swale=basinById('swale');

// Pressure, one basin at a time, and it does not stay.
{
 const dry=createRun({openingSeen:true});dry.mode='playing';assert(!valveState(dry,near).ok,'no pressure before the pump is primed');
 const r=fresh();assert(valveState(r,near).ok);assert(!valveState(r,swale).ok,'the nursery valve is locked before two holds');
 openValve(r,near);wait(r,T.fill-.2);assert.equal(r.basins.near.state,'filling');wait(r,.4);assert.equal(r.basins.near.state,'full');assert(!valveState(r,near).ok);
 openValve(r,basinById('middle'));assert.equal(r.basins.near.state,'draining','a second valve takes the pressure');
 wait(r,T.drain+.2);assert.equal(r.basins.near.state,'dry');wait(r,T.fill+T.hold+T.drain+.5);assert.equal(r.basins.middle.state,'dry','standing water drains by itself');
 assert.equal(r.water,0);assert.equal(stageOf(r),0);
 checks.push('Valves need the pump, feed one basin at a time, and every flood drains');
}
// A full hollow holds him; a half-full one only slows him; a used one is finished.
{
 const pass=r=>Object.assign(r.rig,{x:9,y:26,yaw:-Math.PI/2,direction:-1,lane:0,phase:'pass',deployment:1,cutStartX:30,passSerial:3,attack:null});
 let r=fresh();pass(r);Object.assign(r.basins.near,{state:'filling',level:.6,age:0});wait(r,1.3);assert.equal(r.stats.slips,1);assert.notEqual(r.rig.phase,'mired');assert.equal(r.stage,0);
 r=fresh();pass(r);Object.assign(r.basins.near,{state:'full',level:1,age:0});wait(r,1.2);
 assert.equal(r.rig.phase,'mired');assert.equal(r.stage,1);assert.equal(r.basins.near.state,'spent');assert.match(threat(r),/STUCK/);assert.match(objective(r),/stuck/i);
 const x=r.rig.x;wait(r,T.mire-1.5);assert.equal(r.rig.phase,'mired');assert.equal(r.rig.x,x,'a held machine does not move');
 wait(r,2);assert.equal(r.rig.phase,'pass','he tears free and finishes the strip');assert(!valveState(r,near).ok,'a used hollow cannot be flooded again');
 const restored=createRun(readSave(JSON.stringify(snapshot(r))));assert.equal(restored.stage,1);assert.equal(restored.basins.near.state,'spent');assert.equal(restored.basins.middle.state,'dry');
 checks.push('Full water holds the machine once per hollow, partial water only slips it, and holds survive a retry');
}
// The swale needs two holds, and only the swale ends the round.
{
 const r=createRun({checkpoint:1,openingSeen:true,basins:{spent:['near','far']}});r.mode='playing';assert.equal(r.stage,2);assert(valveState(r,swale).ok);
 Object.assign(r.player,{x:-16,y:86});openValve(r,swale);assert(swaleArmed(r));
 Object.assign(r.rig,{x:16,y:74,yaw:-Math.PI/2,direction:-1,lane:2,phase:'pass',deployment:1,cutStartX:30,passSerial:5,attack:null});
 wait(r,.8);assert(!r.won,'a filling swale does not hold him');
 Object.assign(r.rig,{x:16,y:74,phase:'pass'});Object.assign(r.basins.swale,{state:'full',level:1,age:0});wait(r,.9);assert(r.won);assert.equal(r.checkpoint,2);
 checks.push('The nursery swale opens after two holds and is the only basin that wins');
}
// The bell stands in the open, and the breaker blinds him at a distance.
{
 const r=fresh();Object.assign(r.player,{x:-11.6,y:85,yaw:Math.PI/2});assert(refuge(r.player));assert.notEqual(nearbyAction(r)?.id,'bell','the bell cannot be rung from inside the pavilion');
 assert(Math.hypot(BELL.x+11,BELL.y-85)>4);
 Object.assign(r.player,{x:BREAKER.x+.8,y:BREAKER.y,yaw:-Math.PI/2});assert.equal(nearbyAction(r)?.id,'breaker');
 Object.assign(r.rig,{x:-20,y:50});Object.assign(r.player,{x:5,y:50});const lit=seesPlayer(r);
 Object.assign(r.player,{x:BREAKER.x+.8,y:BREAKER.y,yaw:-Math.PI/2});step(r,{use:true},dt);assert(r.blackout.until>r.time);assert.equal(r.lastNoise.source,'breaker');
 Object.assign(r.player,{x:5,y:50});assert(lit&&!seesPlayer(r),'beyond his lamps he cannot see in the dark');
 wait(r,1);assert(lightsDown(r)>.99);assert(courseLightState(r)<.2);assert.notEqual(nearbyAction(r)?.id,'breaker','the breaker has a cooldown');
 wait(r,BLACKOUT.seconds+BLACKOUT.restore+.2);assert.equal(lightsDown(r),0);
 checks.push('The bell needs open ground; the breaker drops the lights, makes noise and comes back by itself');
}
// A scripted player wins on every cutting plan by flooding the strip he commits to.
const rounds=[];
for(const seed of [0,1,2]){
 const r=createRun({seed});r.mode='playing';Object.assign(r.arrival,{reached:true,ready:true,requested:true});Object.assign(r.player,{x:-3.5,y:3});
 for(let n=0;n<6000&&!r.arrival.open;n++)step(r,{},dt);assert(r.arrival.open);
 r.pump=true;r.checkpoint=1;Object.assign(r.player,{x:10,y:38});
 const use=()=>step(r,{use:true},dt),spot=b=>({x:b.valve.x,y:b.valve.y+(b.valve.y>b.y?.7:-.7),yaw:b.valve.y>b.y?Math.PI:0});
 let last=r.rig.phase,bell=-99;
 for(let n=0;n<60*400&&r.mode==='playing';n++){
  const j=r.rig;
  if(j.phase!==last){last=j.phase;
   if(j.phase==='turn'&&r.stage<2&&j.attack?.axis!=='y'){const b=BASINS.find(b=>!b.final&&b.lane===j.lane&&r.basins[b.id].state==='dry');if(b){Object.assign(r.player,spot(b));use();Object.assign(r.player,{x:10,y:38});}}
  }
  if(r.stage>=2){
   if(r.basins.swale.state==='dry'&&j.phase==='turn'){Object.assign(r.player,spot(swale));use();}
   if(swaleArmed(r)&&r.time-bell>6&&!j.trapApproach){Object.assign(r.player,{x:BELL.x,y:BELL.y+.9,yaw:Math.PI});use();bell=r.time;Object.assign(r.player,{x:-16,y:86});}
  }
  step(r,{},dt);
 }
 assert(r.won,`seed ${seed}: the swale took the machine`);assert.equal(r.stage,2);assert.equal(r.captures,0);
 rounds.push({seed,seconds:+r.time.toFixed(1),floods:r.stats.floods});
}
checks.push('A scripted player holds him twice and sinks him on all three cutting plans');
// The records are the player's to file or keep.
{
 const r=createRun({checkpoint:2,loadLimit:true,evidenceVersion:2});assert.equal(finaleOutcome(r).id,'documented');
 r.recordChoice='kept';assert.equal(finaleOutcome(r).id,'kept');assert.equal(createRun(snapshot(r)).recordChoice,'kept');
 assert.equal(finaleOutcome(createRun({checkpoint:2})).id,'survived');
 checks.push('Keeping or filing the records changes the ending and is saved');
}
console.log(JSON.stringify({passed:true,checks,rounds}));
