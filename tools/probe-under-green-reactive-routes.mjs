import fs from 'node:fs';
import {traverse} from './probe-under-green-folded.mjs';
import {createRun} from '../web/under-green-sim.js';
import {WATERS,inWater,solid,distance} from '../web/under-green-course.js';

const quick=process.argv.includes('--quick'),observed=process.argv.includes('--observe'),kind=(quick?'quick':'full')+(observed?'-observed':'');
const option=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
const out=option('output')||'output/under-green/reactive-routes';
fs.mkdirSync(out,{recursive:true});
const offsets=option('offsets')?.split(',').map(Number)||(quick?[0,2,4,6,8.5,10]:[...Array.from({length:24},(_,i)=>i/2),8.49,8.51,11.99]);
const pressures=option('pressure')?[option('pressure')]:['standard','steady','relentless'];
if(!offsets.length||offsets.some(t=>!Number.isFinite(t)||t<0||t>=12))throw Error('Offsets must be finite cycle times in [0,12)');
if(pressures.some(p=>!['standard','steady','relentless'].includes(p)))throw Error('Unknown pressure profile');
const rows=[],tapes=[];
for(const pressure of pressures)for(const crouch of [false,true])for(const timeOffset of offsets){
 const inputs=[],entries=new Set(),stages=[];let bodyOverlap=false,minimumGap=Infinity,closeSeconds=0,lastPhase='',attacks=0,previousHits=0;
 const result=traverse({cp:2,pressure,crouch,timeOffset,rangeRoute:'reactive',timedKeeper:true,adaptiveRun:true,adaptiveStance:crouch,rearChecks:observed&&crouch,dodge:true,inputTape:inputs,inspect:r=>{
  bodyOverlap||=solid(r.player,.3);const gap=distance(r.player,r.joe);minimumGap=Math.min(minimumGap,gap);if(gap<10)closeSeconds+=1/60;
  if(r.joe.phase==='windup'&&lastPhase!=='windup')attacks++;lastPhase=r.joe.phase;
  for(const w of WATERS.filter(w=>w.id.startsWith('range-')||w.id==='sluice'))if(inWater(r.player,w)&&!entries.has(w.id)){entries.add(w.id);stages.push({name:w.id,frame:inputs.length});}
  if(r.waterHits>previousHits)stages.push({name:'water-hit',frame:inputs.length});previousHits=r.waterHits;
 }});
 const row={pressure,crouch,timeOffset,mode:result.mode,seconds:result.elapsed,hits:result.waterHits,bodyOverlap,minimumGap,closeSeconds,attacks,evasions:result.evasions,gap:result.gap,branches:result.branchChoices,stances:result.stanceChoices,runs:result.runChoices,entries:[...entries],player:{x:result.p.x,y:result.p.y},joe:{x:result.j.x,y:result.j.y,phase:result.j.phase},goal:result.goal};rows.push(row);
 const choices=result.branchChoices.map(c=>c.choice).join('-'),name=`${pressure}-${crouch?'cautious':'walk'}-${choices}`;
 const keep=result.mode!=='complete'&&!tapes.some(t=>t.failed)||pressure==='standard'&&!tapes.some(t=>t.name===name);
 if(keep){const initial=createRun(2,false,pressure);initial.mode='playing';initial.time+=timeOffset;tapes.push({name,failed:result.mode!=='complete',initial,inputs,stages,final:{mode:result.mode,player:result.p,seconds:result.elapsed,hits:result.waterHits},row});}
 fs.writeFileSync(out+`/${kind}-partial.json`,JSON.stringify(rows,null,2));
 if(rows.length%6===0)console.log(JSON.stringify({done:rows.length,complete:rows.filter(r=>r.mode==='complete').length,caught:rows.filter(r=>r.mode==='caught').length,unfinished:rows.filter(r=>r.mode==='playing').length,hits:rows.filter(r=>r.hits).length}));
}
const incomplete=rows.filter(r=>r.mode!=='complete'),failures=rows.filter(r=>r.bodyOverlap||r.mode==='playing'),coverage=[...new Set(rows.map(r=>r.branches.map(c=>c.choice).join('-')))];
const report={rows,incomplete,failures,coverage,observed,pressures,offsets,scope:'Continuous CP2 routes on the recorded pressure profiles and offsets, decisions made separately at A and B using current crossing advice, no future-phase lookup or intermediate actor reset.',limits:['Perfect authored map and evasion knowledge; this is not a human wayfinding or preference test.','Cautious policy stands for chosen wet branches, can stand for an available walking window at the mandatory keeper crossing, and runs for two seconds on an observable imminent-attack cue.',...(observed?['Observed variant additionally glances back for 450ms every three seconds while Joe is audible, and runs for two seconds when a close Joe is actually visible. It does not run from hidden position knowledge.']:[]),'Run-only opportunities use the ordinary bank helper. Dry branch travel is committed to its next connection; the policy does not know future water phases.','Failures are retained as pilot outcomes; neither a caught pilot nor an unfinished evasion establishes an unavoidable loss.']};
fs.writeFileSync(out+`/${kind}.json`,JSON.stringify(report,null,2));fs.writeFileSync(out+`/${kind}-tapes.json`,JSON.stringify(tapes));
console.log(JSON.stringify({cases:rows.length,complete:rows.length-incomplete.length,failures:failures.length,coverage,tapes:tapes.length}));
