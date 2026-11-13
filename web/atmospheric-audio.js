// Quiet world flavor only. No detection/AI input, audio downloads, convolution or new
// sample buffers. One ambience bus, at most six transient voices, all cleaned up.
import {courseSoundscape} from './course-soundscape.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const random=n=>{const v=Math.sin(n*127.1+53.7)*43758.5453;return v-Math.floor(v);};
export const ATMOSPHERE_SITES=[
  {id:'pond-west',kind:'pond',x:-7.2576,z:-34.4,radius:15},
  {id:'pond-east',kind:'pond',x:8.064,z:-41.6,radius:15},
  {id:'pond-north',kind:'pond',x:-7.7184,z:-72.16,radius:14},
  {id:'service-shed',kind:'shed',x:-18,z:-37,radius:18},
  {id:'service-cart',kind:'shed',x:-6.6816,z:-65.44,radius:14},
  {id:'exit-shed',kind:'shed',x:-2.0736,z:-112.16,radius:17},
  {id:'clubhouse',kind:'radio',x:20,z:-52,radius:33},
];
export function atmosphereSpatial(player,source){
  const dx=source.x-player.x,dz=source.z-player.z,distance=Math.hypot(dx,dz),yaw=player.yaw||0;
  return {distance,pan:clamp((dx*Math.cos(yaw)+dz*Math.sin(yaw))/Math.max(2,distance),-.82,.82),level:Math.pow(clamp(1-distance/(source.radius||24),0,1),1.35)};
}
export function createAtmosphericAudio(context,destination,noiseBuffer,onCue=()=>{}){
  const bus=context.createGain();bus.gain.value=0;bus.connect(destination);
  const voices=new Set(),cooldowns=new Map(),history=[],counts={};
  let disposed=false,lastTime=null,nextNature=5,nextSite=8,nextSilence=41,hushUntil=0,lastGhost=null,ghostCooldown=0,sequence=0,seed=71,lastEnabled=false;
  let lastNotice=null,lastRush=null,lastHesitate=null,lastFeint=null,reactionCooldown=0;
  let gazeKey=null;const gazeCues=new Set();
  let report={active:false,hush:1,location:'woodland',voices:0,events:0,maxVoices:0};
  function stopAll(){for(const v of [...voices]){v.gain.gain.cancelScheduledValues(context.currentTime);v.gain.gain.setTargetAtTime(.0001,context.currentTime,.012);try{v.source.stop(context.currentTime+.045);}catch{}}}
  function voice({kind,frequency=0,end=frequency,duration=.5,delay=0,volume=.02,pan=0,type='sine',band=900,q=1,attack=.02,reverse=false}){
    if(disposed||voices.size>=6)return false;
    const now=context.currentTime+delay,source=frequency?context.createOscillator():context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),panner=typeof context.createStereoPanner==='function'?context.createStereoPanner():null;
    if(frequency){source.type=type;source.frequency.setValueAtTime(frequency,now);source.frequency.exponentialRampToValueAtTime(Math.max(20,end),now+duration);filter.type='lowpass';filter.frequency.value=frequency>2000?6000:1800;}
    else{source.buffer=noiseBuffer;source.loop=true;filter.type='bandpass';filter.frequency.setValueAtTime(band,now);filter.frequency.exponentialRampToValueAtTime(band*(reverse?.6:1.12),now+duration);filter.Q.value=q;}
    const peak=now+(reverse?duration*.78:Math.min(attack,duration*.3));
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),peak);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    source.connect(filter);filter.connect(gain);if(panner){panner.pan.value=pan;gain.connect(panner);panner.connect(bus);}else gain.connect(bus);
    const entry={source,gain,kind};voices.add(entry);report.maxVoices=Math.max(report.maxVoices,voices.size);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();panner?.disconnect();voices.delete(entry);};
    source.start(now);source.stop(now+duration+.025);return true;
  }
  function emit(kind,pan,level,time,gazeVariant=0){
    // Reserve enough voices for the complete motif; never truncate it halfway.
    const needed={insects:3,owl:2,pond:3,shed:2,fence:2,radio:5,ghost:3,ghost_notice:2,ghost_rush:3,ghost_hesitate:2,ghost_feint:2,ghost_stare:2,ghost_lookaway:2,ghost_lookback:2}[kind]||1;
    if(voices.size+needed>6)return false;
    const variation=random(seed+sequence++),v=level,base={pan,kind};
    if(kind==='insects')for(let i=0;i<3;i++)voice({...base,frequency:2700+variation*650,end:2480+variation*600,volume:.006*v,duration:.09,delay:i*.19});
    if(kind==='owl')for(let i=0;i<2;i++)voice({...base,frequency:430+variation*65,end:310+variation*45,volume:.018*v,duration:.46,delay:i*.72,attack:.12});
    if(kind==='pond'){
      voice({...base,frequency:190+variation*60,end:110,volume:.016*v,duration:.33,attack:.06});
      voice({...base,frequency:1050,end:570,volume:.011*v,duration:.13,delay:.48});
      voice({...base,band:1750,volume:.012*v,duration:.6,delay:.42});
    }
    if(kind==='shed'){
      voice({...base,frequency:148+variation*30,end:93,volume:.018*v,duration:1.3,type:'triangle',attack:.23});
      voice({...base,band:640,q:3,volume:.016*v,duration:1.5,attack:.3});
    }
    if(kind==='fence'){
      voice({...base,frequency:690,end:520,volume:.01*v,duration:.8,type:'triangle'});
      voice({...base,band:2200,q:4,volume:.015*v,duration:.45,delay:.12});
    }
    if(kind==='radio'){
      // A damaged closing-time chime, deliberately unlike interaction bells or
      // mower rhythms. No intelligible orders or false tactical information.
      for(const [i,hz]of [293.66,369.99,415.3,277.18].entries())voice({...base,frequency:hz*(1+variation*.012),end:hz*.94,volume:.012*v,duration:.68,delay:i*.43,type:'triangle',attack:.04});
      voice({...base,band:1150,q:2,volume:.009*v,duration:2.3,attack:.3});
    }
    if(kind==='ghost'){
      voice({...base,band:1200,q:1.7,volume:.033*v,duration:1.05,delay:.35,reverse:true});
      voice({...base,frequency:370,end:294,volume:.012*v,duration:1.1,delay:.35,reverse:true});
      voice({...base,frequency:393,end:311,volume:.008*v,duration:1,delay:.4,reverse:true});
    }
    if(kind==='ghost_notice'){
      voice({...base,band:1550,q:3,volume:.022*v,duration:.58,reverse:true});
      voice({...base,frequency:487,end:463,volume:.013*v,duration:.62,type:'triangle',attack:.16});
    }
    if(kind==='ghost_rush'){
      voice({...base,band:1900,q:1.8,volume:.028*v,duration:.72,attack:.09});
      voice({...base,frequency:233,end:71,volume:.018*v,duration:.7,type:'triangle',attack:.06});
      voice({...base,frequency:251,end:79,volume:.011*v,duration:.65,attack:.08});
    }
    if(kind==='ghost_hesitate'){
      // A caught breath and dry, descending throat tone at the actual stop.
      voice({...base,band:780,q:3.8,volume:.020*v,duration:.22,attack:.025});
      voice({...base,frequency:187,end:139,volume:.014*v,duration:.32,type:'triangle',attack:.025});
    }
    if(kind==='ghost_feint'){
      // A reversed scrape swells as the retreat turns back toward the player.
      voice({...base,band:2350,q:2.4,volume:.025*v,duration:.45,reverse:true});
      voice({...base,frequency:219,end:137,volume:.016*v,duration:.5,delay:.08,type:'triangle',attack:.1});
    }
    if(kind==='ghost_stare'){
      voice({...base,band:gazeVariant===1?620:gazeVariant===2?1390:990,q:4,volume:.017*v,duration:gazeVariant===1?1:.75,reverse:true});
      voice({...base,frequency:gazeVariant===1?173:gazeVariant===2?373:311,end:gazeVariant===1?139:gazeVariant===2?281:296,volume:.012*v,duration:.8,delay:gazeVariant===2?.28:0,type:'triangle',attack:gazeVariant===1?.35:.25});
    }
    if(kind==='ghost_lookaway'){
      voice({...base,band:gazeVariant===1?810:gazeVariant===2?2150:1650,q:2.8,volume:.022*v,duration:gazeVariant===1?.8:.5,reverse:gazeVariant!==1});
      voice({...base,frequency:gazeVariant===1?97:gazeVariant===2?181:133,end:gazeVariant===1?129:83,volume:.013*v,duration:.55,delay:gazeVariant===2?.3:0,type:'triangle',attack:.1});
    }
    if(kind==='ghost_lookback'){
      voice({...base,band:gazeVariant===1?1100:gazeVariant===2?530:720,q:4.2,volume:.018*v,duration:gazeVariant===1?.6:.23,attack:gazeVariant===1?.16:.02});
      voice({...base,frequency:gazeVariant===1?193:gazeVariant===2?317:263,end:173,volume:.012*v,duration:.4,delay:gazeVariant===2?.28:0,type:'triangle',attack:.03});
    }
    counts[kind]=(counts[kind]||0)+1;report.events++;history.push({kind,time,pan,level,gazeVariant});if(history.length>12)history.shift();
    onCue({kind,pan,time});return true;
  }
  function reset(){stopAll();lastTime=null;nextNature=5;nextSite=8;nextSilence=41;hushUntil=0;lastGhost=lastNotice=lastRush=lastHesitate=lastFeint=gazeKey=null;gazeCues.clear();ghostCooldown=reactionCooldown=0;cooldowns.clear();seed+=13;report.hush=1;}
  function update(frame){
    if(disposed)return {hush:1};
    const t=frame.time||0;
    if(lastTime!==null&&t<lastTime)reset();
    const enabled=!!frame.active&&frame.volume>0;
    if(!enabled){if(lastEnabled)stopAll();bus.gain.setTargetAtTime(0,context.currentTime,.025);lastEnabled=false;report.active=false;return {hush:1};}
    lastEnabled=true;report.active=true;
    const region=courseSoundscape(frame.courseY??-frame.player.z/.16);
    report.zone=region.zone;report.natureGain=region.nature;report.bedGain=region.bed;
    // Let a note already playing decay at the boundary, then retire only local
    // environmental voices. Never stop a ghost or a gameplay sound here.
    const authoredHush=clamp(frame.authoredHush??1,0,1);report.authoredHush=authoredHush;
    if((region.zone==='dead_green'&&region.nature<.005)||authoredHush<.2)for(const v of voices){
      if(!v.retiring&&['insects','owl','pond','shed','radio','fence'].includes(v.kind)){
        v.retiring=true;v.gain.gain.cancelScheduledValues(context.currentTime);
        v.gain.gain.setTargetAtTime(.0001,context.currentTime,.12);
        try{v.source.stop(context.currentTime+.5);}catch{}
      }
    }
    const warning=frame.suspensePhase==='warning'||frame.suspensePhase==='approach'||frame.encounterPhase==='warning';
    const recovery=!warning&&(frame.suspensePhase==='recovery'||frame.encounterPhase==='recovery');
    const closing=!!frame.finale;
    const shelter=clamp(frame.shelter||0,0,1);report.shelter=shelter;
    const protectedCue=frame.focus||frame.priority||warning||authoredHush<1||shelter>.05;
    // Leave room around the real mower; recovery restores the natural soundscape.
    const hush=(recovery?1:warning?.46:t<hushUntil?(.16+.84*clamp((t-(hushUntil-.6))/.6,0,1)):closing?.72:1)*region.bed*authoredHush*(1-.45*shelter);
    report.hush=hush;bus.gain.setTargetAtTime((frame.focus?.18:frame.priority?.12:1)*hush,context.currentTime,.12);
    if(lastTime===t)return {hush};lastTime=t;
    if(t>=nextSilence){nextSilence=t+43+random(seed+sequence)*23;if(!protectedCue&&!recovery&&frame.pressure>.2){hushUntil=t+2.5;report.silences=(report.silences||0)+1;}}
    const ghost=frame.ghost;
    if(ghost&&gazeKey!==ghost.key){gazeKey=ghost.key;gazeCues.clear();}
    if(ghost&&!protectedCue&&!recovery&&frame.apparitions&&t>=reactionCooldown){
      const gazeKind=['stare','lookaway','lookback'].includes(ghost.gazeGesture)&&!gazeCues.has(ghost.gazeGesture)?'ghost_'+ghost.gazeGesture:null;
      const kind=gazeKind|| (ghost.gesture==='feint'&&lastFeint!==ghost.key?'ghost_feint':ghost.gesture==='hesitate'&&lastHesitate!==ghost.key?'ghost_hesitate':ghost.phase==='rush'&&lastRush!==ghost.key?'ghost_rush':ghost.phase==='notice'&&lastNotice!==ghost.key?'ghost_notice':null);
      if(kind){
        const spatial=atmosphereSpatial(frame.player,{...ghost,radius:20});
        if(spatial.level>.01&&emit(kind,spatial.pan,Math.max(.35,spatial.level),t,gazeKind?ghost.gazeVariant||0:0)){
          if(gazeKind){gazeCues.add(ghost.gazeGesture);if(ghost.phase==='rush')lastRush=ghost.key;}
          else if(kind==='ghost_feint')lastFeint=ghost.key;
          else if(kind==='ghost_hesitate'){lastHesitate=ghost.key;if(ghost.phase==='rush')lastRush=ghost.key;}
          else if(kind==='ghost_rush')lastRush=ghost.key;else lastNotice=ghost.key;
          lastGhost=ghost.key;
          reactionCooldown=t+.65;nextSite=Math.max(nextSite,t+2);nextNature=Math.max(nextNature,t+2);
          return {hush};
        }
      }
    }
    if(ghost&&ghost.key!==lastGhost){lastGhost=ghost.key;if(!protectedCue&&!recovery&&frame.apparitions&&t>=ghostCooldown){const spatial=atmosphereSpatial(frame.player,{...ghost,radius:35});if(spatial.level>.01&&emit('ghost',spatial.pan,Math.max(.35,spatial.level),t)){ghostCooldown=t+19;hushUntil=t+.75;}}}
    if(protectedCue||(!recovery&&t<hushUntil))return {hush};
    const candidates=ATMOSPHERE_SITES.map(site=>{const spatial=atmosphereSpatial(frame.player,site);return {site,...spatial,level:spatial.level*region[site.kind]};}).filter(s=>s.level>.045).sort((a,b)=>b.level-a.level);
    report.location=candidates[0]?.site.kind||'woodland';
    if(!recovery&&!closing&&t>=nextSite){
      nextSite=t+3;
      const near=candidates.find(s=>t>=(cooldowns.get(s.site.id)||0));
      if(near&&emit(near.site.kind,near.pan,near.level,t)){cooldowns.set(near.site.id,t+(near.site.kind==='radio'?38:15)+random(sequence)*10);nextSite=t+7;}
      else if(region.fence>.02&&Math.abs(frame.player.x)>9&&emit('fence',atmosphereSpatial(frame.player,{x:Math.sign(frame.player.x)*13.1,z:frame.player.z,radius:10}).pan,.65*region.fence,t))nextSite=t+19;
    }
    if(t>=nextNature){
      nextNature=t+9+random(seed+sequence)*10;
      const owl=!recovery&&!closing&&sequence%4===2,pan=random(seed+sequence*7)*1.5-.75;
      if(region.nature>.005)emit(owl?'owl':'insects',pan,region.nature*(report.location==='pond'?.65:1)*(closing?.5:1),t);
    }
    return {hush};
  }
  return {update,reset,stats:()=>({...report,voices:voices.size,counts:{...counts},history:history.map(e=>({...e})),maxAllowedVoices:6}),dispose(){if(disposed)return;stopAll();bus.disconnect();disposed=true;}};
}
