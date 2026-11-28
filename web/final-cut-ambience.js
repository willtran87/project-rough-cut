import {SWALE} from './final-cut-course.js';

// Extra sound layers for the final round, synthesised into the chapter's
// existing category buses (so every volume slider, mute and pause already
// applies): a heartbeat and breath that follow pressure, swale frogs and
// treeline crickets with position, a second and third music layer, Joe's
// horn, and a bird's wings. Presentation only: it reads the run, never writes.
export function createFinalCutAmbience(){
 let ctx=null,buses=null,nodes=null,quiet=0,exertion=0,lastTime=0,owner=null;
 const stats={attached:false,sources:0,beats:0,horns:0,flutters:0,frogs:0,crickets:0,breath:0,pad:0,frogsQuiet:false};
 // Schedule only changed targets: a repeated target continues the same curve.
 const targets=new Map(),set=(param,v,t=.05)=>{const last=targets.get(param);if(last&&last.t===t&&Math.abs(last.v-v)<=1e-4)return;targets.set(param,{v,t});param.setTargetAtTime(v,ctx.currentTime,t);};
 function attach(graph){
  if(ctx||!graph?.ctx)return;ctx=graph.ctx;buses=graph.buses;
  const noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=noise.getChannelData(0);let seed=8123;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.5;}
  const voice=(bus,type,frequency,filterType,cutoff,q=.7)=>{
   const source=type==='noise'?ctx.createBufferSource():ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),pan=ctx.createStereoPanner();
   if(type==='noise'){source.buffer=noise;source.loop=true;}else{source.type=type;source.frequency.value=frequency;}
   filter.type=filterType;filter.frequency.value=cutoff;filter.Q.value=q;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(buses[bus]);source.start();stats.sources++;
   return {source,filter,gain,pan};
  };
  nodes={noise,breath:voice('effects','noise',0,'bandpass',760,.9),crickets:voice('ambience','sine',4350,'highpass',2500),frogs:voice('ambience','sawtooth',176,'lowpass',620,2),
   pad:voice('music','sawtooth',123.5,'lowpass',380),padHigh:voice('music','triangle',165,'lowpass',700),hornLow:voice('mower','square',311,'lowpass',1300),hornHigh:voice('mower','square',370,'lowpass',1300)};
  stats.attached=true;
 }
 // Two thumps per beat. level 0..1.
 function beat(level){
  if(!ctx||!(level>0))return;stats.beats++;
  for(const [delay,gain,hz]of [[0,.2,58],[.13,.13,47]]){
   const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+delay;o.type='sine';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(hz*.62,t+.11);
   g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain*level),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.16);
   o.connect(g);g.connect(buses.danger);o.start(t);o.stop(t+.2);
  }
 }
 const PATTERNS={long:[[0,1.15]],double:[[0,.16],[.26,.34]],taps:[[0,.12],[.5,.12],[1,.12]],short:[[0,.2]]};
 function horn(pattern,pan,level){
  if(!ctx)return;stats.horns++;
  for(const v of [nodes.hornLow,nodes.hornHigh]){const g=v.gain.gain,t=ctx.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(0,t);v.pan.pan.setValueAtTime(Math.max(-1,Math.min(1,pan)),t);
   for(const [at,length]of PATTERNS[pattern]||PATTERNS.short){g.setValueAtTime(0,t+at);g.linearRampToValueAtTime(.075*level,t+at+.02);g.setValueAtTime(.075*level,t+at+length);g.linearRampToValueAtTime(0,t+at+length+.06);}
  }
 }
 function flutter(pan,level){
  if(!ctx)return;stats.flutters++;
  const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),p=ctx.createStereoPanner(),t=ctx.currentTime;s.buffer=nodes.noise;f.type='bandpass';f.frequency.value=2300;f.Q.value=1.2;p.pan.value=Math.max(-1,Math.min(1,pan));
  g.gain.setValueAtTime(0,t);for(let k=0;k<7;k++){g.gain.linearRampToValueAtTime(.09*level*(1-k/9),t+k*.075+.02);g.gain.linearRampToValueAtTime(.004,t+k*.075+.06);}g.gain.linearRampToValueAtTime(0,t+.62);
  s.connect(f);f.connect(g);g.connect(p);p.connect(buses.effects);s.start(t);s.stop(t+.7);
 }
 function update(r,{tension=0,frequency=82.41,reduced=false}={}){
  if(!ctx)return;
  const p=r.player,j=r.rig,yaw=p.yaw+p.rearAngle,live=['playing','aftermath'].includes(r.mode),dt=owner===r?Math.max(0,Math.min(.1,r.time-lastTime)):0;owner=r;lastTime=r.time;
  const panTo=(x,y)=>{const dx=x-p.x,dy=y-p.y;return (dx*Math.cos(yaw)-dy*Math.sin(yaw))/Math.max(1,Math.hypot(dx,dy));};
  // Breath: builds with running and with pressure, settles when still.
  const running=p.speed>4.6;exertion=Math.max(0,Math.min(1,exertion+dt*(running?.11:-.07)));
  const air=Math.max(exertion*.8,tension>.5?(tension-.5)*1.6:0),rate=1.7+air*2.4,cycle=Math.sin(r.time*rate),breath=live&&!r.won&&!p.focus?air*.03*Math.pow(Math.abs(cycle),1.5):0;
  set(nodes.breath.gain.gain,breath,.04);set(nodes.breath.filter.frequency,cycle>0?900:620,.05);stats.breath=+breath.toFixed(4);
  // Frogs sit in the swale and stop when the machine or the player is on them.
  const dFrog=Math.hypot(SWALE.x-p.x,SWALE.y-p.y),threat=Math.hypot(SWALE.x-j.x,SWALE.y-j.y)<17&&!['waiting','disabled'].includes(j.phase)||j.phase==='pass'&&Math.hypot(j.x-p.x,j.y-p.y)<22||dFrog<5||r.won;
  quiet=Math.max(0,Math.min(1,quiet+dt*(threat?2.5:-.22)));stats.frogsQuiet=quiet>.5;
  const croakPhase=(r.time*.62+Math.sin(r.time*.13)*.5)%1,croak=croakPhase>0&&croakPhase<.2?Math.sin(croakPhase/.2*Math.PI)*(.55+.45*Math.sin(r.time*61)):0,frogs=live?croak*.05*(1-quiet)/(1+dFrog*.06)*(p.focus?1.4:1):0;
  set(nodes.frogs.gain.gain,frogs,.012);set(nodes.frogs.source.frequency,croakPhase<.1?168:196,.02);nodes.frogs.pan.pan.value=panTo(SWALE.x,SWALE.y);stats.frogs=+frogs.toFixed(4);
  // Crickets hold the west treeline; they thin out under the floodlit pass.
  const chirp=r.time%1.3<.42?Math.pow(Math.max(0,Math.sin(r.time*Math.PI*2*15)),2):0,crickets=live&&!r.won?chirp*.012*(1-quiet*.7)*(p.focus?1.5:1)/(1+Math.abs(-33-p.x)*.03):0;
  set(nodes.crickets.gain.gain,crickets,.006);nodes.crickets.pan.pan.value=panTo(-33,p.y+6);stats.crickets=+crickets.toFixed(4);
  // Music: a fifth above the existing drone swells with pressure; a high
  // tremolo joins only while a pass is committed on the player.
  const pressure=live&&!p.focus?r.drama.pressure:0,committed=r.drama.phase==='committed'||r.drama.phase==='approach';
  set(nodes.pad.source.frequency,frequency*1.5,.4);set(nodes.pad.gain.gain,pressure*.011,.5);stats.pad=+(pressure*.011).toFixed(4);
  set(nodes.padHigh.source.frequency,frequency*4,.2);set(nodes.padHigh.gain.gain,committed?pressure*.009*(reduced?.8:.6+.4*Math.sin(r.time*11)):0,.08);
 }
 return {attach,update,beat,horn,flutter,stats:()=>({...stats}),get ready(){return !!ctx;}};
}
