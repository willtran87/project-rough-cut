import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot} from '../web/final-cut-sim.js';
import {joeExpression} from '../web/final-cut-joe-expression.js';
import {planAmbush,ambushPath,ambushTell} from '../web/final-cut-ambush.js';
const cases=[];
for(const entry of ['west','east','north','south'])for(const evade of [false,true]){
 const r=createRun({checkpoint:1});r.mode='playing';r.water=0;r.pump=false;
 Object.assign(r.player,{x:['north','south'].includes(entry)?21.5:0,y:50,yaw:0});
 Object.assign(r.rig,{x:entry==='west'?-30:30,y:entry==='north'?66:26,yaw:entry==='west'?-Math.PI/2:Math.PI/2,lane:1,passSerial:['north','west'].includes(entry)?1:2,seen:true});
 const attack=planAmbush(r,1,'observed player',false);assert.equal(attack.entry,entry);
 Object.assign(r.rig,{attack,path:ambushPath(r.rig,attack),direction:attack.axis==='x'?Math.sign(attack.to.x-attack.from.x):Math.sign(attack.to.y-attack.from.y),phase:'turn',age:0,deployment:0});
 let tellAt=null;const seen=new Set();
 for(let n=0;n<5400;n++){
  if(ambushTell(r)&&tellAt===null)tellAt=r.time;
  const dodge=evade&&tellAt!==null&&r.time-tellAt>=.55&&r.time-tellAt<2.2;
  step(r,dodge?(['north','south'].includes(entry)?{strafe:-1}:{forward:-1}):{},1/60);
  const before=JSON.stringify(r),face=joeExpression(r);assert.equal(JSON.stringify(r),before,'Rendering must not mutate simulation');seen.add(face.to);
  if(r.mode==='caught'){assert.equal(face.to,'scrutiny');break;}
  if(r.rig.phase==='pass')assert.equal(face.to,'attack');
  if(r.rig.phase==='disengage'&&r.rig.age>.2){assert.equal(face.to,'frustrated');assert.equal(face.blend,1);break;}
 }
 assert(seen.has('search')&&seen.has('attack'));assert(seen.has(evade?'frustrated':'scrutiny'));assert.equal(r.mode,evade?'playing':'caught');
 const old=joeExpression(r);r.mode='paused';step(r,{},.25);assert.deepEqual(joeExpression(r),old);
 cases.push({entry,evade,expressions:[...seen]});
}
const ending=[];
for(const age of [0,.12,.4,.7,2,5.9,6,6.5,7,12,30]){
 const r=createRun({checkpoint:2,ending:{age}}),face=joeExpression(r),restored=joeExpression(createRun(snapshot(r)));
 assert.deepEqual(restored,face);assert(face.blend>=0&&face.blend<=1);
 ending.push({age,...face});
}
assert.equal(ending.find(e=>e.age===2).to,'panic');assert.equal(ending.find(e=>e.age===7).blend,1);assert.equal(ending.find(e=>e.age===30).to,'frustrated');
fs.mkdirSync('output/final-cut/joe-expressions',{recursive:true});fs.writeFileSync('output/final-cut/joe-expressions/rules.json',JSON.stringify({passed:true,cases,ending},null,2));console.log('PASS: 8 actual cardinal capture/escape sequences, pause, non-mutating presentation, 11 ending/restoration states.');
