import fs from 'node:fs';
import {step,createRun} from '../web/under-green-sim.js';
import {keeperInside,distance,SLUICE} from '../web/under-green-course.js';
import {observeJoe} from '../web/under-green-senses.js';
import {counterplay} from './probe-under-green-keeper-counterplay.mjs';
import {traverse} from './probe-under-green-folded.mjs';
const out='output/under-green/reactive-counterplay';fs.mkdirSync(out,{recursive:true});
// Ordinary accepted closure with an approaching, audible Joe. This fixture
// reproduces generic proximity text hiding the player's active commitment.
const closure=createRun(3);closure.mode='playing';closure.time=68.75;closure.messageTime=0;
Object.assign(closure.player,{x:SLUICE.x,y:SLUICE.y+1,yaw:Math.PI});
Object.assign(closure.joe,{x:12,y:21,yaw:Math.atan2(closure.player.x-12,closure.player.y-21),phase:'walk',last:{x:closure.player.x,y:closure.player.y}});
const closureInitial=structuredClone(closure);step(closure,{use:true});for(let i=1;i<8;i++)step(closure,{});
const observed=observeJoe(closure);
if(!closure.closing||!observed.audible||observed.imminent||closure.joe.speed<=.2||closure.joe.closingRate<=.3||observed.distance>=8)throw Error('Closure/proximity fixture no longer reproduces its conditions');
fs.writeFileSync(out+'/closing-fixture.json',JSON.stringify({initial:closureInitial,frames:8,result:closure}));
if(process.argv.includes('--closure-only'))process.exit(0);
const saved=JSON.parse(fs.readFileSync('output/under-green/reactive-routes/full-observed-tapes.json')).find(t=>t.failed);
const inputs=[],result=traverse({cp:2,pressure:'relentless',crouch:true,timeOffset:1.5,rangeRoute:'reactive',timedKeeper:true,adaptiveRun:true,adaptiveStance:true,rearChecks:true,dodge:true,inputTape:inputs});
const initial=createRun(2,false,'relentless');initial.mode='playing';initial.time+=1.5;
const tapes=[saved,{name:'relentless-cautious-dry-dry',initial,inputs,final:{mode:result.mode}}],reports=[];
for(const tape of tapes){
const r=structuredClone(tape.initial),moments=[];
for(let i=0;i<tape.inputs.length;i++){
 const input=tape.inputs[i];r.player.yaw=input.yaw;step(r,input.input);
 if(r.mode!=='playing')break;
 if(r.sluiceBlocked&&!moments.some(m=>m.name==='refused'))moments.push({name:'refused',frame:i,run:structuredClone(r)});
 if(r.sluiceBlocked&&observeJoe(r).imminent&&!moments.some(m=>m.name==='rev'))moments.push({name:'rev',frame:i,run:structuredClone(r)});
}
const rows=[];
for(const moment of moments)for(const delay of [0,.25,.5])for(const side of [-1,1]){
 const initial=structuredClone(moment.run);for(let t=0;t<delay*60;t++)step(initial,{crouch:moment.run.player.crouched,focus:moment.run.player.focus});
 const result=counterplay(initial,side),row={moment:moment.name,delay,side,initial:{time:initial.time,player:initial.player,joe:initial.joe,gap:distance(initial.player,initial.joe),inside:keeperInside(initial.player)},mode:result.final.mode,seconds:result.result.seconds,hits:result.result.hits,stage:result.result.stage};rows.push(row);
 const file=`${out}/${tape.name}-${moment.name}-${delay}-${side}.json`;fs.writeFileSync(file,JSON.stringify(result));row.file=file;
 fs.writeFileSync(out+'/partial.json',JSON.stringify({completed:reports,current:{source:tape.name,rows}},null,2));console.log(JSON.stringify({source:tape.name,moment:moment.name,delay,side,mode:row.mode,seconds:row.seconds,hits:row.hits,stage:row.stage}));
}
reports.push({source:tape.name,moments,rows});
}
fs.writeFileSync(out+'/expanded.json',JSON.stringify({reports},null,2));
