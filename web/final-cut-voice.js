import {JOE_LINES} from './final-cut-dialogue-lines.js';
export async function loadJoeAssets(extra=[]){
 const clips=new Map(),errors=[];
 await Promise.all([...JOE_LINES,...extra].map(async line=>{try{const response=await fetch(line.url);if(!response.ok)throw Error(`HTTP ${response.status}`);clips.set(line.id,await response.arrayBuffer());}catch(error){errors.push(`${line.id}: ${error.message}`);}}));
 return {clips,errors};
}
// One transient voice at most. Simulation time owns offsets; pause stops the
// source, danger cancels it, and a late decoder cannot queue stale dialogue.
export function createFinalCutVoice(context,destination,assets){
 const gain=context.createGain(),pan=context.createStereoPanner(),filter=context.createBiquadFilter();gain.gain.value=0;filter.type='lowpass';filter.frequency.value=3200;filter.connect(gain);gain.connect(pan);pan.connect(destination);
 const buffers=new Map(),report={ready:false,decoded:0,errors:[],playing:false,starts:0,resumes:0,activeSources:0,maxSources:0,offset:0,id:null};
 let source=null,owner=null,key=null,started=false,skipped=false,ended=false,offset=0,at=0,disposed=false;
 const ready=assets.then(async result=>{report.errors.push(...result.errors);await Promise.all([...result.clips].map(async([id,data])=>{try{const buffer=await context.decodeAudioData(data.slice(0));if(!disposed)buffers.set(id,buffer);}catch(error){report.errors.push(`${id}: ${error.message}`);}}));report.decoded=buffers.size;report.ready=true;});
 function stop(){if(source){const old=source;source=null;old.onended=null;old.stop();old.disconnect();}report.playing=false;report.activeSources=0;}
 function update(frame){
  if(disposed)return;
  if(owner!==frame.owner){stop();owner=frame.owner;key=null;}
  const line=frame.line;if(!line){stop();key=null;report.id=null;return;}
  const next=`${line.id}:${line.started}`;
  if(key!==next){stop();key=next;started=skipped=ended=false;report.id=line.id;}
  const elapsed=Math.max(0,frame.time-line.started);report.offset=elapsed;
  if(frame.danger){stop();skipped=true;return;}
  if(!frame.active){stop();return;}
  if(!started&&elapsed>.45)skipped=true;
  const buffer=buffers.get(line.id);if(skipped||ended||!buffer)return;
  if(elapsed>=buffer.duration){stop();ended=true;return;}
  gain.gain.setTargetAtTime(frame.level,context.currentTime,.035);pan.pan.setTargetAtTime(frame.pan,context.currentTime,.035);filter.frequency.setTargetAtTime(frame.clear?3200:1500,context.currentTime,.08);
  if(source&&Math.abs(offset+context.currentTime-at-elapsed)>.3)stop();
  if(!source){const node=context.createBufferSource();source=node;node.buffer=buffer;node.connect(filter);node.onended=()=>{node.disconnect();if(source===node){source=null;ended=true;report.playing=false;report.activeSources=0;}};if(started)report.resumes++;else report.starts++;started=true;offset=elapsed;at=context.currentTime;node.start(0,elapsed);report.playing=true;report.activeSources=1;report.maxSources=Math.max(report.maxSources,1);}
 }
 return {ready,update,stats:()=>({...report,errors:[...report.errors]}),dispose(){disposed=true;stop();buffers.clear();filter.disconnect();gain.disconnect();pan.disconnect();}};
}
