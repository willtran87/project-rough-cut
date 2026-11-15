import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave} from '../web/final-cut-sim.js';
import {AMBUSH,planAmbush,ambushPath,ambushTell,heardPlayer,wetFooting,seesPlayer} from '../web/final-cut-ambush.js';
import {WALLS,FIXTURES,isCut} from '../web/final-cut-course.js';
import {rigWallHit} from '../web/final-cut-rig.js';
const out='output/final-cut/ambush';fs.mkdirSync(out,{recursive:true});const cases=[];
function fixture(entry){
 const r=createRun({checkpoint:1});r.mode='playing';r.water=0;r.pump=false;
 Object.assign(r.player,{x:['north','south'].includes(entry)?21.5:0,y:50,yaw:0});
 Object.assign(r.rig,{x:entry==='west'?-30:30,y:entry==='north'?66:26,yaw:entry==='west'?-Math.PI/2:Math.PI/2,lane:1,passSerial:['north','west'].includes(entry)?1:2,seen:true});
 const a=planAmbush(r,1,'observed player',false);assert.equal(a.entry,entry);
 Object.assign(r.rig,{attack:a,path:ambushPath(r.rig,a),direction:a.axis==='x'?Math.sign(a.to.x-a.from.x):Math.sign(a.to.y-a.from.y),phase:'turn',age:0,deployment:0});return r;
}
for(const hz of [30,60,120,144])for(const entry of ['west','east','north','south'])for(const evade of [false,true]){
 const r=fixture(entry);let tellAt=null,passAt=null,peak=0,travelPeak=0,last={x:r.rig.x,y:r.rig.y},ended=false;
 for(let n=0;n<hz*90;n++){
  const tell=ambushTell(r);if(tell&&tellAt===null)tellAt=r.time;
  const dodge=evade&&tellAt!==null&&r.time-tellAt>=.55&&r.time-tellAt<2.2;
  step(r,dodge?(['north','south'].includes(entry)?{strafe:-1}:{forward:-1}):{},1/hz);
  const j=r.rig;assert(Math.hypot(j.x-last.x,j.y-last.y)<=AMBUSH.travelSpeed/hz+.03,'No teleport');last={x:j.x,y:j.y};
  assert(!rigWallHit(j,WALLS),`${entry}: masonry intersection`);
  assert(!rigWallHit(j,FIXTURES),`${entry}: permanent fixture intersection`);
  if(j.attack.axis==='y'&&j.phase==='pass')assert(!rigWallHit(j,[{id:'feed-pipe',x:17,y:56,w:.28,d:37,h:.35},{id:'manifold-cap',x:17.35,y:74,w:.3,d:.3,h:.9}]),'Vertical charge clears irrigation');
  if(j.phase==='turn')travelPeak=Math.max(travelPeak,j.speed);
  if(j.phase==='pass'){passAt??=r.time;peak=Math.max(peak,j.speed);}
  if(r.mode==='caught'||passAt!==null&&j.phase==='disengage'){ended=true;break;}
 }
 assert(ended);assert(tellAt!==null&&passAt!==null);assert(passAt-tellAt>=AMBUSH.warning-1/hz-.01);
 assert.equal(r.mode,evade?'playing':'caught',`${entry}/${hz}/${evade}`);
 if(evade){assert(Math.abs(peak-AMBUSH.cutSpeed)<.001);if(['north','south'].includes(entry)){assert(isCut(r,{x:21.5,y:50}));const restored=createRun(readSave(JSON.stringify(snapshot(r))));assert(isCut(restored,{x:21.5,y:50}));}}
 cases.push({hz,entry,evade,tellAt,passAt,peak,travelPeak,result:r.mode});
}
let r=fixture('north');const locked=JSON.stringify(r.rig.attack);for(let n=0;n<180;n++){r.player.x=-20;step(r,{},1/60);}assert.equal(JSON.stringify(r.rig.attack),locked);
r.mode='paused';const before=JSON.stringify(r);step(r,{},.25);assert.equal(JSON.stringify(r),before);
r=fixture('west');Object.assign(r.player,{x:0,y:50,crouch:false});assert(!seesPlayer(r),'Service reeds block vision');
Object.assign(r.player,{x:0,y:60});r.rig.phase='waiting';r.arrival.requested=false;for(let n=0;n<15;n++)step(r,{forward:1,sprint:true},1/60);assert(heardPlayer(r));
r=fixture('east');Object.assign(r.player,{x:8,y:74});r.water=1;assert(wetFooting(r));r.rig.phase='waiting';r.arrival.requested=false;step(r,{forward:1},1/60);assert(Math.abs(r.player.speed-3.84*.78)<.01);
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,cases,checks:['Four cardinal captures and walking reaction escapes at four frame rates','Full-size masonry clearance and bounded physical travel','Warning before every committed attack','No retarget after commitment; pause freezes everything','Vertical mowing persists after reload','Reeds block sight; sprinting creates a remembered sound','Saturated turf slows actual movement']},null,2));console.log(`PASS: ${cases.length} cardinal contact/escape cases, physical clearance, tells, saves, noise and wet footing.`);
