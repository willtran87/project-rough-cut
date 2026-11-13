import fs from 'node:fs';
import assert from 'node:assert/strict';
import {traverse} from './probe-under-green-folded.mjs';
import {createRun} from '../web/under-green-sim.js';
import {WATERS,waterState,waterLocal,inWater,distance} from '../web/under-green-course.js';

const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/range-cadence/advised';fs.mkdirSync(out,{recursive:true});
const analyzeOnly=process.argv.includes('--analyze');
const stances=[['walk',{}],['sprint',{sprint:true}],['crouch',{crouch:true}]];
const channels=WATERS.filter(w=>w.id.startsWith('range-')||w.id==='sluice');
const runs=analyzeOnly?JSON.parse(fs.readFileSync(out+'/balance-partial.json')):[],tapes=[];
if(!analyzeOnly)for(const [stance,input] of stances){
 for(let timeOffset=0;timeOffset<12;timeOffset+=.5)for(const wet of [false,true]){
  const keep=stance==='walk'&&[0,5].includes(timeOffset),inputTape=keep?[]:undefined;
  const arrivals={},entries={},clears={},stages=[],waits={};
  let minimumGap=Infinity,closeSeconds=0,attacks=0,previousPhase='',lastHits=0;
  const result=traverse({cp:2,timeOffset,wet,timedKeeper:true,dodge:true,...input,inputTape,inspect:r=>{
   const gap=distance(r.player,r.joe);minimumGap=Math.min(minimumGap,gap);if(gap<10)closeSeconds+=1/60;
   if(r.joe.phase==='windup'&&previousPhase!=='windup')attacks++;previousPhase=r.joe.phase;
   for(const w of channels){
    const local=waterLocal(r.player,w),state=waterState(w,r.time,r.bypass,r.bypassAt);
    const mark=stage=>{if(keep)stages.push({stage:`${w.id}-${stage}`,frame:inputTape.length,phase:state.phase});};
    if(!arrivals[w.id]&&Math.abs(local.x)<w.width/2&&local.y>w.depth/2&&local.y<w.depth/2+2){arrivals[w.id]={time:r.time,phase:state.phase,safeFor:state.safeFor};mark('approach');}
    if(!entries[w.id]&&inWater(r.player,w)){entries[w.id]={time:r.time,phase:state.phase};mark('entry');}
    if(entries[w.id]&&!clears[w.id]&&local.y<-(w.depth/2+.4)&&Math.abs(local.x)<w.width/2-.35){clears[w.id]={time:r.time,phase:state.phase,gap};mark('clear');}
    if(Math.abs(local.x)<w.width/2&&local.y>w.depth/2&&local.y<w.depth/2+2&&r.player.speed<.1)waits[w.id]=(waits[w.id]||0)+1/60;
   }
   if(r.waterHits>lastHits&&keep)stages.push({stage:'water-recovery',frame:inputTape.length});lastHits=r.waterHits;
  }});
  const row={stance,timeOffset,wet,mode:result.mode,seconds:result.elapsed,waterHits:result.waterHits,solid:result.solid,evasions:result.evasions,minimumGap,closeSeconds,attacks,finalGap:result.gap,waits,arrivals,entries,clears};runs.push(row);
  if(keep){const initial=createRun(2);initial.mode='playing';initial.time+=timeOffset;tapes.push({name:`${wet?'wet':'dry'}-${timeOffset}`,initial,inputs:inputTape,stages,final:{mode:result.mode,player:result.p,hits:result.waterHits,seconds:result.elapsed}});}
  fs.writeFileSync(out+'/balance-partial.json',JSON.stringify(runs,null,2));
  if(runs.length%12===0)console.log(JSON.stringify({progress:runs.length,stance,last:row.mode,seconds:row.seconds}));
 }
}
const comparisons=[];
for(let i=0;i<runs.length;i+=2){const [dry,wet]=runs.slice(i,i+2);comparisons.push({stance:dry.stance,timeOffset:dry.timeOffset,dryMode:dry.mode,wetMode:wet.mode,difference:wet.seconds-dry.seconds,dryGap:dry.finalGap,wetGap:wet.finalGap,dryHits:dry.waterHits,wetHits:wet.waterHits});}
assert.equal(runs.length,144,'Only a complete retained matrix may be analyzed');
// These are committed route policies, not a promise that every decision is
// survivable at every speed. Preserve the established walk/run dry fallback;
// for sustained crouch, require a completed choice from every sampled arrival.
// Report all caught pilots explicitly; do not relabel their attempts successes.
const failures=runs.filter(r=>r.solid||!['complete','caught'].includes(r.mode)||!r.wet&&r.stance!=='crouch'&&r.mode!=='complete'||r.wet&&r.mode==='complete'&&channels.some(w=>!r.entries[w.id]||!r.clears[w.id]));
const noCompletedPolicy=comparisons.filter(r=>r.dryMode!=='complete'&&r.wetMode!=='complete');
const tradeoffs=stances.map(([stance])=>{const pairs=comparisons.filter(r=>r.stance===stance&&r.dryMode==='complete'&&r.wetMode==='complete');return {stance,wetFaster:pairs.filter(r=>r.difference<-.5).length,dryFaster:pairs.filter(r=>r.difference>.5).length};});
const passed=!failures.length&&!noCompletedPolicy.length&&tradeoffs.every(t=>t.wetFaster&&t.dryFaster);
const fixedPolicyDefeats=runs.filter(r=>r.mode==='caught');
fs.writeFileSync(out+'/balance.json',JSON.stringify({passed,runs,comparisons,tradeoffs,failures,noCompletedPolicy,fixedPolicyDefeats,scope:'144 continuous live-Joe pump-checkpoint-to-exit runs: 24 half-second arrival offsets, walk/sprint/crouch, wet/dry. Both branches follow keeper advice. No intermediate state resets. Each arrival must have a completed policy; committed all-crouch decisions are not all guaranteed survival.',limits:['Perfect map/phase knowledge, scripted ordinary-input evasion; not human comprehension or preference.','A completed alternate route proves an available choice at the starting state, not guaranteed recovery after a long wrong-route commitment.','Standard pressure, forward authored routes. Reverse/lateral/occupied landings and other pressure profiles require separate evidence.','Waiting is sampled near the authored approach banks, not all idle time.']},null,2));
if(!analyzeOnly)fs.writeFileSync(out+'/tapes.json',JSON.stringify(tapes));
assert.deepEqual(failures,[]);assert.deepEqual(noCompletedPolicy,[]);assert(tradeoffs.every(t=>t.wetFaster&&t.dryFaster),JSON.stringify(tradeoffs));
console.log(JSON.stringify({passed,cases:runs.length,tradeoffs}));
