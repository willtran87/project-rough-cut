import {floodState} from './under-green-flood.js';
import {WATERS,waterState} from './under-green-course.js';
import {audibleSource} from './under-green-senses.js';
import {footSurface} from './under-green-grating.js';
import {TRIMMER} from './under-green-trimmer.js';

export function createUnderGreenAudio(preferences=()=>({volume:.72})){
 let ctx,master,buffer,engine,teeth,water,playerStep,joeStep,knock,mechanism,crowd,muted=false,lastRun=null,lastPlayer=-1,lastKnock='',seen=new WeakSet(),heardContacts=new WeakSet(),lastFootstep=null;
 const counts={joeSteps:0,playerSteps:0,door:0,starter:0,pump:0,pipeKnocks:0,gate:0,bladeBlocked:0,applause:0};let targets={};
 const voices=[];let storyIndex=-1;
 function voice(kind,hz=200,offset=0){
  const source=kind==='noise'?ctx.createBufferSource():ctx.createOscillator(),filter=ctx.createBiquadFilter(),level=ctx.createGain(),pan=ctx.createStereoPanner();
  if(kind==='noise'){source.buffer=buffer;source.loop=true;}else{source.type=kind;source.frequency.value=hz;}
  filter.type='lowpass';filter.frequency.value=1600;level.gain.value=0;source.connect(filter);filter.connect(level);level.connect(pan);pan.connect(master);
  if(kind==='noise')source.start(0,offset);else source.start();
  const v={source,filter,level,pan};voices.push(v);return v;
 }
 function start(){
  if(ctx){ctx.resume();return;}ctx=new AudioContext();master=ctx.createGain();master.gain.value=0;
  const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-15;compressor.ratio.value=4;master.connect(compressor);compressor.connect(ctx.destination);
  buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const samples=buffer.getChannelData(0);let seed=31;
  for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;samples[i]=((seed>>>0)/2147483648-1)*.5;}
  engine=voice('noise',200,.31);teeth=voice('noise',200,.73);
  // Allocate once. Offset the shared noise buffer so opposite outlets do not
  // produce the same waveform and collapse perceptually to a phantom source.
  water=WATERS.map((outlet,i)=>({outlet,voice:voice('noise',200,i*.193)}));
  playerStep=voice('noise');joeStep=[voice('noise'),voice('noise')];knock=voice('sine',260);mechanism=voice('noise');crowd=voice('noise');
  playerStep.filter.frequency.value=290;joeStep.forEach(v=>v.filter.frequency.value=180);crowd.filter.type='bandpass';crowd.filter.frequency.value=1500;crowd.filter.Q.value=.7;
 }
 function pulse(v,gain,seconds,pan=0,hz){
  const t=ctx.currentTime;v.pan.pan.setValueAtTime(pan,t);if(hz)v.filter.frequency.setValueAtTime(hz,t);
  v.level.gain.cancelScheduledValues(t);v.level.gain.setValueAtTime(Math.max(.0001,gain),t);v.level.gain.exponentialRampToValueAtTime(.0001,t+seconds);v.level.gain.setValueAtTime(0,t+seconds+.01);
 }
 function update(r){
  if(!ctx)return;const t=ctx.currentTime,pref=preferences(),live=['playing','aftermath'].includes(r.mode),p=r.player,j=r.joe,focus=p.focus===true;
  beginRun(r);
  if(storyIndex>=0&&r.mode==='intro'){
   for(const v of voices){v.level.gain.cancelScheduledValues(t);v.level.gain.setTargetAtTime(0,t,.12);}
   master.gain.setTargetAtTime(!muted&&!globalThis.document?.hidden ? .5*(pref.volume??.72):0,t,.08);
   water[0].voice.filter.frequency.setTargetAtTime(330,t,.1);water[0].voice.level.gain.setTargetAtTime(.045*(pref.ambienceVolume??.9),t,.2);
   engine.filter.frequency.setTargetAtTime(storyIndex===2?280:90,t,.1);engine.level.gain.setTargetAtTime((storyIndex===2?.055:.018)*(pref.mowerVolume??1),t,.2);
   targets={live:false,story:storyIndex,water:.045,breathing:storyIndex===2?.055:0};return;
  }
  const position=(source,range=30,sourceHeight=1)=>audibleSource(r,source,{range,sourceHeight});
  const joe=position(j,36),rev=j.phase==='windup'||j.phase==='sweep',entering=j.phase==='enter';
  // A hand scythe has no motor. Breath, leather strain and blade air carry proximity.
  const engineOn=j.phase!=='absent'&&(!entering||j.age>.8);
  const ending=r.mode==='aftermath'?Math.max(.06,1-r.aftermathAge/3):1;
  const breath=.3+.7*Math.max(0,Math.sin(r.time*2.4));
  const engineTarget=live&&engineOn?joe.gain*(rev?.16:.10)*breath*(focus?1.2:1)*ending*(pref.mowerVolume??1):0;
  master.gain.setTargetAtTime(live&&!muted?.5*(pref.volume??.72):0,t,.06);
  engine.filter.frequency.setTargetAtTime(rev?680:joe.gain<.2?180:360,t,.08);engine.level.gain.setTargetAtTime(engineTarget,t,.06);engine.pan.pan.setTargetAtTime(joe.pan,t,.05);
  const cut=Math.sin(Math.PI*Math.min(1,j.age/TRIMMER.sweepSeconds));
  const swish=live&&engineOn?joe.gain*(j.phase==='sweep'?.12+.22*cut:j.phase==='windup'?.035:.004)*(pref.mowerVolume??1)*ending:0;
  teeth.filter.type='bandpass';teeth.filter.Q.value=.7;teeth.filter.frequency.setTargetAtTime(j.phase==='sweep'?1100+1400*cut:650,t,.025);teeth.level.gain.setTargetAtTime(swish,t,j.phase==='sweep'?.012:.04);teeth.pan.pan.setTargetAtTime(joe.pan,t,.05);
  let waterTarget=0,waterPan=0,weight=0,warning=null;
  const outlets=[];
  for(const {outlet:w,voice:v} of water){
   const state=waterState(w,r.time,r.bypass,r.bypassAt),source=position(w,19,.8),gain=(state.danger?.28:state.phase==='warning'?.11:.025)*source.gain;
   waterTarget=Math.max(waterTarget,gain);waterPan+=source.pan*gain;weight+=gain;
   outlets.push({id:w.id,phase:state.phase,gain,pan:source.pan});
   v.pan.pan.setTargetAtTime(source.pan,t,.08);
   v.filter.frequency.setTargetAtTime(focus?650:1300,t,.1);
   if(state.phase==='warning'&&source.gain>.15&&(!warning||source.gain>warning.gain))warning={...source,id:w.id+':'+Math.floor(r.time*3)};
  }
  // Retain the previous aggregate gain budget, distributed between sources.
  // More audible outlets must not multiply the masking of Joe's warning cues.
  waterTarget*=focus?.32:1;waterTarget*=pref.ambienceVolume??.9;waterTarget*=r.finished?.25:1;
  if(!live)waterTarget=0;
  const waterScale=weight?waterTarget/weight:0;
  outlets.forEach((outlet,i)=>{
   outlet.gain*=waterScale;
   water[i].voice.level.gain.setTargetAtTime(outlet.gain,t,.08);
  });
  const effects=pref.effectsVolume??1;
  if(live&&warning&&warning.id!==lastKnock){lastKnock=warning.id;pulse(knock,.12*warning.gain*(pref.dangerVolume??.9),.12,warning.pan);}
  const foot=Math.floor(p.walk/.72);
  if(live&&foot!==lastPlayer&&p.speed>.2){counts.playerSteps++;const metal=footSurface(p)==='metal';playerStep.filter.type=metal?'bandpass':'lowpass';playerStep.filter.Q.value=metal?6:1;pulse(playerStep,.1*(focus?.35:1)*effects,metal?.25:.095,0,metal?680:290);}
  lastPlayer=foot;
  for(const event of r.events){
   if(seen.has(event))continue;seen.add(event);if(!live)continue;
   if(event.type==='joe-enter'){counts.door++;pulse(mechanism,.25*joe.gain*effects,.4,joe.pan,520);}
   if(event.type==='bypass'){counts.pump++;pulse(mechanism,.24*effects,1.2,.2,450);}
   if(event.type==='pipe-knock'){const source=position(event,48,3.65);counts.pipeKnocks++;pulse(mechanism,.38*effects*source.gain,.55,source.pan,340);}
   if(event.type==='closing'){counts.gate++;pulse(mechanism,.18*effects,1.3,0,820);}
   if(event.type==='blade-blocked'){counts.bladeBlocked++;pulse(mechanism,.2*joe.gain*effects,.22,joe.pan,2600);}
   if(event.type==='secured'){pulse(mechanism,.35*effects,.55,0,180);}
  }
  const applause=live&&r.mode==='aftermath'&&r.aftermathAge>1.3;
  if(applause&&!counts.applause)counts.applause++;
  const applauseGain=applause?(.02+.02*Math.max(0,Math.sin(r.time*17))*Math.max(0,Math.sin(r.time*23)))*Math.min(1,(r.aftermathAge-1.3)/.8)*(pref.ambienceVolume??.9):0;
  const flood=floodState(r.elapsed),floodGain=live&&!r.finished?(.035*flood.warning+.065*flood.depth/.38)*(focus?.35:1)*(pref.ambienceVolume??.9):0;
  crowd.filter.frequency.setTargetAtTime(applause?1600:flood.phase==='warning'?95:360,t,.2);crowd.level.gain.setTargetAtTime(applauseGain+floodGain,t,.15);crowd.pan.pan.setTargetAtTime(applause?Math.sin(r.time*.7)*.35:0,t,.2);
  if(!live)for(const v of [playerStep,...joeStep,knock,mechanism,crowd]){v.level.gain.cancelScheduledValues(t);v.level.gain.setTargetAtTime(0,t,.02);}
  targets={weapon:'grass-scythe',focus,engine:engineTarget,breathing:engineTarget,bladeSwish:swish,water:waterTarget,outlets,joeDistance:joe.distance,joePan:joe.pan,waterPan:weight?waterPan/weight:0,applause:applauseGain,flood:floodGain,floodPhase:flood.phase,live};
 }
 function beginRun(r){
  if(lastRun===r)return;lastRun=r;lastPlayer=Math.floor(r.player.walk/.72);lastKnock='';seen=new WeakSet();heardContacts=new WeakSet();lastFootstep=null;
  for(const key in counts)counts[key]=0;
 }
 function footContacts(r,events){
  if(!ctx)return;beginRun(r);
  for(const event of events){
   if(heardContacts.has(event))continue;heardContacts.add(event);
   if(event.owner!==r||!['playing','aftermath'].includes(r.mode)||muted||event.time!==r.time)continue;
   const pref=preferences(),p=r.player;
   const source=audibleSource(r,event,{sourceHeight:.12,range:36});
   const gain=source.gain*.2*(p.focus?1.35:1)*(pref.effectsVolume??1);
   if(gain<=0)continue;
   const surface=footSurface(event),metal=surface==='metal',voice=joeStep[event.foot];
   voice.filter.type=metal?'bandpass':'lowpass';voice.filter.Q.value=metal?6:1;
   pulse(voice,gain,metal?.28:.12,source.pan,metal?680:180);counts.joeSteps++;
   lastFootstep={serial:event.serial,time:event.time,foot:event.foot,phase:event.phase,pan:source.pan,gain,surface};
  }
 }
 return {start,update,footContacts,setStory(index,r){storyIndex=index;update(r);},setMuted(v){muted=v;if(ctx&&v)master.gain.setTargetAtTime(0,ctx.currentTime,.03);},stats:()=>({started:!!ctx,muted,voices:voices.length,waterVoices:water?.length||0,voiceCapacity:8+WATERS.length,footGains:joeStep?.map(v=>v.level.gain.value)||[],pan:engine?.pan.pan.value||0,water:water?.reduce((sum,v)=>sum+v.voice.level.gain.value,0)||0,master:master?.gain.value||0,counts:{...counts},lastFootstep,targets:{...targets}}),dispose(){ctx?.close();}};
}
