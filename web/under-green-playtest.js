import {createLocalTelemetry,telemetrySnapshot} from './local-telemetry.js';

const copy=value=>JSON.parse(JSON.stringify(value));
const progress=r=>({checkpoint:r.checkpoint,bypass:!!r.bypass,evidence:!!r.evidence,lessonCrossed:!!r.lessonCrossed});
const observedTypes=new Set(['checkpoint','water-hit','joe-enter','joe-inspection','bypass','evidence','closing','closure-cancelled','secured','caught','complete','blade-blocked']);

// Bounded, opt-in diagnostic state. No storage, network, identity or gameplay
// decisions. Archived attempts hold snapshots, not their live simulation runs.
export function createUnderGreenPlaytest({attemptLimit=12,eventLimit=256}={}){
 const limit=Math.max(2,Math.min(24,attemptLimit|0)),eventCap=Math.max(1,Math.min(2048,eventLimit|0)),history=[];
 let current=null,serial=0,droppedAttempts=0;
 function snapshot(ended=false,reason=null){
  const {run:r,startElapsed,startProgress,checkpointAt,inputs,events,droppedEvents}=current;
  const telemetry=telemetrySnapshot(r.telemetry),crossings=Object.values(r.telemetry?.crossings||{}).map(c=>({...c,finished:!!c.finished,seconds:c.finished?c.seconds:r.time-c.start,waterHits:c.finished?c.waterHits:r.waterHits-c.waterHits}));
  return copy({attempt:current.id,outcome:r.finished?'escaped':r.mode==='caught'?'caught':ended?'interrupted':'in-progress',mode:r.mode,endReason:reason,
   recordedFromSeconds:startElapsed,activeSeconds:Math.max(0,r.elapsed-startElapsed),startProgress,endProgress:progress(r),inputMethods:[...inputs],
   secondsSinceCheckpoint:Math.max(0,r.elapsed-checkpointAt),failure:r.failure||null,waterHits:r.waterHits-current.startHits,crossings,
   metrics:telemetry?.metrics||{},stateEntries:{windup:telemetry?.metrics.windupEntries||0,sweep:telemetry?.metrics.sweepEntries||0,recovery:telemetry?.metrics.recoverEntries||0},
   outcomes:{captures:events.filter(e=>e.type==='caught').length,blockedBlades:current.blockedBlades,secured:r.finished===true},
   events,eventsDropped:droppedEvents,telemetry});
 }
 function close(reason='run-replaced'){
  if(!current)return;history.push(snapshot(true,reason));current=null;
  while(history.length>=limit){history.shift();droppedAttempts++;}
 }
 function observe(r,inputMethod){
  if(current&&current.run!==r)close();
  if(!current){
   if(!['playing','aftermath'].includes(r.mode))return;
   if(!r.telemetry?.enabled)r.telemetry=createLocalTelemetry(eventCap);
   current={run:r,id:++serial,startElapsed:r.elapsed,startHits:r.waterHits,startProgress:progress(r),checkpoint:r.checkpoint,checkpointAt:r.elapsed,inputs:new Set(),seen:new WeakSet(r.events),events:[],droppedEvents:0,blockedBlades:0};
  }
  if(['keyboard','gamepad','touch'].includes(inputMethod))current.inputs.add(inputMethod);
  if(current.checkpoint!==r.checkpoint){current.checkpoint=r.checkpoint;current.checkpointAt=r.elapsed;}
  for(const event of r.events){
   if(current.seen.has(event))continue;current.seen.add(event);
   if(!observedTypes.has(event.type))continue;
   if(event.type==='blade-blocked')current.blockedBlades++;
   if(current.events.length>=eventCap){current.events.shift();current.droppedEvents++;}
   current.events.push({...event,time:Number.isFinite(event.time)?event.time:r.time});
  }
 }
 function report({sessionKind='unclassified',notes='',waterRule='',decision='',context={}}={}){
  const kinds=['unclassified','unfamiliar-player','repeat-player','automated'];
  return {version:1,chapter:'under-the-green',sessionKind:kinds.includes(sessionKind)?sessionKind:'unclassified',classification:'Selected by the recorder; not independently verified.',
   observations:{notes:String(notes).slice(0,2000),waterRule:String(waterRule).slice(0,1000),decision:String(decision).slice(0,1000)},context:copy(context),
   attempts:[...history.map(copy),...(current?[snapshot()]:[])],droppedAttempts,attemptLimit:limit,
   definitions:{choice:'Observed visits: undecided, wet, dry, or mixed. This does not infer player intent.',parent:'An outlet record is contained within the named encounter. Do not add its time, hits or exposure to the parent totals. Outlet dry visits count alongside its channel, not at connecting landings.',partial:'Recording began inside the encounter or entered away from its starting bank.',waitSeconds:'Stationary time in the encounter, excluding water recovery; not inferred hesitation.',minimumGap:'Geometric separation, not proof of visible danger or fear.',secondsSinceCheckpoint:'Active recorded play since the latest observed checkpoint; no wall-clock pause time.',stateEntries:'Observed state entries, not a claim that every recovery was a deliberate dodge.'}};
 }
 return {observe,close,report,summary:()=>({retained:history.length+(current?1:0),dropped:droppedAttempts})};
}

export function mountUnderGreenPlaytest(parent,context){
 const recorder=createUnderGreenPlaytest(),panel=document.createElement('details');panel.id='local-playtest';
 panel.innerHTML='<summary>Local playtest report</summary><p>Recording this page session locally. Nothing is uploaded. Download before leaving or reloading; only the latest 12 attempts are retained.</p><label>Session type<select id="playtest-kind"><option value="unclassified">Unclassified</option><option value="unfamiliar-player">Unfamiliar player</option><option value="repeat-player">Returning player</option><option value="automated">Automated check</option></select></label><label>How would you describe the water rule?<textarea id="playtest-water" maxlength="1000" rows="2"></textarea></label><label>Describe a route choice and what happened.<textarea id="playtest-decision" maxlength="1000" rows="2"></textarea></label><label>Other observations (optional)<textarea id="playtest-notes" maxlength="2000" rows="3"></textarea></label><p id="playtest-count"></p><button id="playtest-download" type="button">Download local report</button><p id="playtest-status" role="status"></p>';
 parent.append(panel);
 panel.querySelector('#playtest-download').onclick=()=>{
  const status=panel.querySelector('#playtest-status');
  try{
   const report=recorder.report({sessionKind:panel.querySelector('#playtest-kind').value,waterRule:panel.querySelector('#playtest-water').value,decision:panel.querySelector('#playtest-decision').value,notes:panel.querySelector('#playtest-notes').value,context:context()});
   const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='under-green-playtest.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   status.textContent='Report download started. Your recording remains available in this page.';
  }catch{status.textContent='The download could not start. Your recording remains available; try again.';}
 };
 return {...recorder,refresh(){const s=recorder.summary(),text=`${s.retained} attempt${s.retained===1?'':'s'} retained${s.dropped?`; ${s.dropped} older attempts discarded`:''}.`;const el=panel.querySelector('#playtest-count');if(el.textContent!==text)el.textContent=text;}};
}
