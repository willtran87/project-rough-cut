import {lineClear} from './final-cut-course.js';
import {scoreFrame} from './final-cut-drama.js';
import {uneaseFrame} from './final-cut-unease.js';
import {approachingCut} from './final-cut-messages.js';
import {createFinalCutVoice,loadJoeAssets} from './final-cut-voice.js';
import {announcementClip,PA_POSITION} from './final-cut-announcement.js';
import {createFinalCutFootsteps} from './final-cut-footsteps.js';
import {ambushTell,reedsOcclude} from './final-cut-ambush.js';
// Fifteen continuous voices plus at most one decoded cab-speaker line.
export function createFinalCutAudio(preferences,initialRun){
 let ctx=null,master=null,running=false,lastRun=null,heard=new Set(),voices={},buses={},speech=null,footsteps=null;const speechAssets=loadJoeAssets(initialRun?[announcementClip(initialRun)]:[]);
 const stats={sources:0,events:0,muted:false};
 function start(){
  if(ctx){ctx.resume();return;}
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ctx=new Audio();master=ctx.createGain();master.connect(ctx.destination);
  for(const name of ['mower','effects','ambience','danger','music']){const gain=ctx.createGain();gain.connect(master);buses[name]=gain;}
  const noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=noise.getChannelData(0);let seed=497;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.45;}
  for(const [name,type,frequency,bus]of [['engine','sawtooth',43,'mower'],['reels','noise',800,'mower'],['wind','noise',350,'ambience'],['pump','noise',1500,'effects'],['bell','sine',890,'effects'],['step','noise',180,'effects'],['pulse','sine',49,'danger'],['music','triangle',82,'music'],['ceremony','noise',1700,'ambience'],['chime','triangle',660,'ambience'],['crack','noise',2100,'effects'],['scrape','noise',900,'effects'],['traffic','noise',450,'ambience'],['breath','noise',650,'effects'],['rustle','noise',2600,'effects']]){
   const source=type==='noise'?ctx.createBufferSource():ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),pan=ctx.createStereoPanner();filter.type='lowpass';filter.frequency.value=frequency;
   if(type==='noise'){source.buffer=noise;source.loop=true;}else{source.type=type;source.frequency.value=frequency;}
   gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(buses[bus]);source.start();voices[name]={source,filter,gain,pan,type};stats.sources++;
  }speech=createFinalCutVoice(ctx,buses.effects,speechAssets);footsteps=createFinalCutFootsteps(ctx,voices.step);ctx.resume();
 }
 const value=(param,v,t=.05)=>param.setTargetAtTime(v,ctx.currentTime,t);
 function update(r){
  if(!ctx)return;const prefs=preferences(),live=['playing','aftermath'].includes(r.mode);stats.muted=!!prefs.muted;
  const score=scoreFrame(r);stats.score=score;
  const pa=r.announcement.active&&!r.drama.active,emitter=pa?PA_POSITION:r.rig;
  const vx=emitter.x-r.player.x,vy=emitter.y-r.player.y,vd=Math.hypot(vx,vy),view=r.player.yaw+r.player.rearAngle,voiceClear=pa?true:lineClear(r.player,r.rig);
  speech.update({owner:r,line:r.drama.active||r.announcement.active,time:r.time,active:live&&!document.hidden&&!prefs.muted,danger:approachingCut(r),pan:(vx*Math.cos(view)-vy*Math.sin(view))/Math.max(1,vd),level:(pa?.65:.85)/(1+vd*.015)*(voiceClear?1:.55),clear:voiceClear});
  value(master.gain,(live||r.mode==='caught')&&!document.hidden&&!prefs.muted?prefs.volume:0,.035);
  for(const name in buses)value(buses[name].gain,prefs[name==='mower'?'mowerVolume':name+'Volume']??1);
  if(lastRun!==r){lastRun=r;heard.clear();for(const name of ['bell','crack','scrape']){voices[name].gain.gain.cancelScheduledValues(ctx.currentTime);voices[name].gain.gain.setValueAtTime(0,ctx.currentTime);}voices.crack.filter.frequency.setValueAtTime(2100,ctx.currentTime);voices.scrape.filter.frequency.setValueAtTime(900,ctx.currentTime);}
  footsteps.update(r,live&&!document.hidden&&!prefs.muted&&prefs.volume>0&&prefs.effectsVolume>0&&ctx.state==='running',prefs.footsteps??.8);
  if(r.mode==='caught'){
   const id='capture:'+r.captures;
   if(!heard.has(id)){
    heard.add(id);stats.events++;stats.captureKind=r.failure?.kind;stats.captureImpacts=(stats.captureImpacts||0)+1;
    for(const v of Object.values(voices)){v.gain.gain.cancelScheduledValues(ctx.currentTime);v.gain.gain.setValueAtTime(0,ctx.currentTime);}
    const cutting=r.failure?.kind==='cutting-bank';
    for(const [name,level,hz,duration]of [['crack',.12,cutting?1700:420,.14],['scrape',.09,cutting?850:180,cutting?.38:.26]]){
     const v=voices[name];v.filter.frequency.setValueAtTime(hz,ctx.currentTime);v.pan.pan.setValueAtTime((r.failure?.side||1)*.3,ctx.currentTime);
     v.gain.gain.setValueAtTime(level,ctx.currentTime);v.gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);v.gain.gain.setValueAtTime(0,ctx.currentTime+duration+.02);
    }
   }
   running=false;return;
  }
  const dx=r.rig.x-r.player.x,dy=r.rig.y-r.player.y,d=Math.hypot(dx,dy),yaw=r.player.yaw+r.player.rearAngle,pan=(dx*Math.cos(yaw)-dy*Math.sin(yaw))/Math.max(1,d);
  const clear=lineClear(r.player,r.rig,.9)&&!reedsOcclude(r.player,r.rig),occluded=(r.player.focus?1.1:1)*(clear?1:.45),attenuation=1/(1+d*.055),j=r.rig,disabled=j.phase==='disabled'||!r.arrival.ready,bog=j.phase==='bogged';stats.machineryOccluded=!clear;
  value(voices.engine.pan.pan,pan);value(voices.reels.pan.pan,pan);
  value(voices.engine.source.frequency,disabled?23:bog?Math.max(24,50-j.age*3):j.phase==='pass'?64:39+Math.min(16,j.speed||0));
  value(voices.engine.filter.frequency,disabled?80:clear?280:140);value(voices.engine.gain.gain,disabled?0:attenuation*.18*occluded);
  value(voices.reels.gain.gain,(j.phase==='pass'?attenuation*.24:bog?Math.max(0,.2-j.age*.03):disabled?0:.008)*(clear?1:.65));value(voices.reels.filter.frequency,j.phase==='pass'?(clear?1800:650):500);
  const tell=ambushTell(r),rx=(tell?.x??j.x)-r.player.x,ry=(tell?.y??j.y)-r.player.y,rd=Math.hypot(rx,ry);
  value(voices.rustle.pan.pan,(rx*Math.cos(yaw)-ry*Math.sin(yaw))/Math.max(1,rd));
  value(voices.rustle.filter.frequency,1800+600*Math.sin(r.time*15));
  value(voices.rustle.gain.gain,tell?(.13+.08*Math.pow(Math.sin(r.time*18),2))/(1+rd*.035)*(r.player.focus?1.35:1):0,.015);
  stats.rustle=tell?{entry:tell.entry,pan:(rx*Math.cos(yaw)-ry*Math.sin(yaw))/Math.max(1,rd),distance:rd}:null;
  const sluice=r.route==='drain'&&r.player.y<-10,drip=Math.pow(Math.max(0,Math.sin(r.time*5.3)),16);
  value(voices.wind.gain.gain,r.player.focus?.008:(uneaseFrame(r,prefs.reducedMotion).wind??score.wind));value(voices.pump.filter.frequency,sluice?2300:1500);value(voices.pump.gain.gain,r.pump?(r.ending.secured?.012:r.player.focus?.025:.08):sluice?.06*drip:0,.015);
  value(voices.pulse.gain.gain,live?score.pulse:0);
  const ceremony=r.opening.ceremony&&!r.opening.firstCut&&!r.won;
  // A deliberately mechanical PA applause/chime cycle, stopped by the first
  // completed cut. Engine and reel cues continue through the sudden silence.
  const finalApplause=r.won&&r.ending.age>=8&&r.ending.age<9.2,clap=finalApplause?Math.pow(Math.max(0,Math.sin((r.ending.age-8)*28)),10):(r.time%3.6)<2.4?Math.pow(Math.max(0,Math.sin(r.time*28)),10):0;
  value(voices.ceremony.gain.gain,(ceremony||finalApplause)&&!r.player.focus?clap*.07*(pa?.15:1):0,.006);
  value(voices.chime.source.frequency,[660,825,990,825][Math.floor(r.time*2)%4]);value(voices.chime.filter.frequency,1400);
  value(voices.chime.gain.gain,ceremony&&!r.player.focus&&r.time%3.6>2.7?.018*(pa?.15:1):0,.015);
  const paX=32-r.player.x,paY=49-r.player.y,paDistance=Math.hypot(paX,paY),paPan=(paX*Math.cos(yaw)-paY*Math.sin(yaw))/Math.max(1,paDistance);
  value(voices.ceremony.pan.pan,paPan);value(voices.chime.pan.pan,paPan);
  value(voices.music.gain.gain,score.music);value(voices.music.source.frequency,score.frequency,.3);value(voices.music.filter.frequency,280);
  stats.ceremony=ceremony;stats.ceremonyStopped=r.opening.firstCut;stats.protectedPass=r.opening.closePass;
  const road=r.won&&r.player.y>98,passing=.5+.5*Math.sin(r.time*.22);
  value(voices.traffic.gain.gain,road?.012+.025*passing:0);value(voices.traffic.pan.pan,Math.sin(r.time*.11));
  value(voices.breath.gain.gain,road?.012*Math.pow(Math.max(0,Math.sin(r.time*2)),2):0);
  stats.roadMix=road;stats.arrivalSound=sluice?'sluice drips':r.route==='garage'&&r.player.y<-10?'garage service walk':null;stats.engineStarted=r.arrival.ready;stats.finalApplause=r.won&&r.ending.age>=8&&r.ending.age<9.2;
  for(const e of r.events){const id=e.time+':'+e.type+':'+(e.id||'');if(e.time<r.time-.12||heard.has(id))continue;if(['break-prop','protected-pass','manifold-rupture','rig-shutdown','gate-latched','garage-latch'].includes(e.type)){
   heard.add(id);if(heard.size>128)heard.delete(heard.values().next().value);stats.events++;const v=voices[e.type==='break-prop'?'crack':'scrape'],ex=(e.x??j.x)-r.player.x,ey=(e.y??j.y)-r.player.y,dist=Math.hypot(ex,ey);
   v.pan.pan.setValueAtTime((ex*Math.cos(yaw)-ey*Math.sin(yaw))/Math.max(1,dist),ctx.currentTime);v.gain.gain.cancelScheduledValues(ctx.currentTime);v.gain.gain.setValueAtTime(.22/(1+dist*.06),ctx.currentTime);v.gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+(e.type==='break-prop'||e.type==='gate-latched'?.35:1.3));
  }else if(['bell','ball-land','pump','victory'].includes(e.type)){
   heard.add(id);if(heard.size>128)heard.delete(heard.values().next().value);stats.events++;const v=voices.bell,ex=(e.x??r.player.x)-r.player.x,ey=(e.y??r.player.y)-r.player.y,dist=Math.hypot(ex,ey);v.pan.pan.setValueAtTime((ex*Math.cos(yaw)-ey*Math.sin(yaw))/Math.max(1,dist),ctx.currentTime);v.source.frequency.setValueAtTime(e.type==='bell'?890:e.type==='ball-land'?1250:e.type==='pump'?280:105,ctx.currentTime);v.gain.gain.cancelScheduledValues(ctx.currentTime);v.gain.gain.setValueAtTime((e.type==='ball-land'?.09:.15)/(1+dist*.06),ctx.currentTime);v.gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+(e.type==='bell'?2.4:.5));
  }}running=live;
 }
 return {start,update,stats:()=>({...stats,footsteps:footsteps?.stats(),voice:speech?.stats()||{ready:false,playing:false},context:ctx?.state||'unstarted',running}),dispose(){footsteps?.silence();speech?.dispose();ctx?.close();}};
}
