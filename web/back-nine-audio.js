import {experienceMotor} from './chase-experience.js';
import {createCourseAmbienceAudio} from './chase-course-ambience.js';
import {createRunnerFootstepAudio} from './runner-footstep-audio.js';
import {encounterQuiet} from './chase-encounter.js';
import {createChaseScore} from './chase-score.js';
import {createChaseAtmosphere} from './chase-atmosphere.js';
import {listenerYaw} from './runner-look.js';
import {mowerSoundPlacement} from './chase-machine-sound.js';
import {createPursuitFeedback} from './pursuit-feedback.js';
import {createRunoverAudio} from './runover-audio.js';
import {createCartDamageAudio} from './cart-damage-audio.js';
import {chaseActor} from './chase-player.js';
import {pressurePose} from './chase-pressure.js';
import {commitmentPose} from './chase-commitments.js';
import {COURSE} from './back-nine-course.js';
import {ramWindup} from './ram-windup.js';
import {cartRumble} from './cart-rumble.js';
import {panicPose} from './chase-panic.js';
const clampSpeed=speed=>Math.min(1,Math.abs(speed)/9);
// Fourteen persistent voices, including the five-voice chase score and a short body thump and metal/noise strike.
// Impact envelopes reuse the same nodes; sustained contact cannot grow a pool.
export function createChaseAudio(volume=.72,settings={}){
 let score=null,footsteps=null,courseAmbience=null,coolingTick=-1,coolingPlays=0,motorMix=1,rollingAudio=false;
 const buses={};
 const channels=Object.entries({effects:['effectsVolume',1],mower:['mowerVolume',1],ambience:['ambienceVolume',.9],danger:['dangerVolume',.9]});
 // These five mixer parameters have one owner and no scheduled envelopes.
 // Repeating the same exponential target/time constant continues the same
 // curve; do not enqueue it again on every fixed simulation tick. Voice
 // envelopes, moving sources and music retain their authored scheduling.
 const mixerTargets=new WeakMap();
 function mixerTarget(param,value,now,constant){
  const prior=mixerTargets.get(param);
  if(prior&&prior.value===value&&prior.constant===constant)return;
  param.setTargetAtTime(value,now,constant);
  if(prior){prior.value=value;prior.constant=constant;}
  else mixerTargets.set(param,{value,constant});
 }
 function mix(preferences=settings){for(const [name,[key,fallback]]of channels)mixerTarget(buses[name].gain,preferences[key]??fallback,ctx.currentTime,.03);}
 let introIndex=-1,introPlaying=false,spatial={pan:0,distance:0,engineHz:31,occluded:false};
 const atmosphere=createChaseAtmosphere();const approach=createPursuitFeedback();let approachLevel=0;
 let runoverAudio=null,damageAudio=null,ctx=null,master=null,cart=null,mower=null,blade=null,pan=null,drone=null,harmonic=null,alarmPan=null,pulse=null,wind=null,thump=null,crash=null,impactPan=null,lastRun=null,lastImpact=0,lastLatch=false,latchPlays=0,impactPlays=0,lastFX=0,coursePlays=0,muted=false,rumbleLevel=0,lastLaunch=0,ramLaunchPlays=0,lastTime=null,beat=0,lastPanic=0,panicPlays=0,panicLevel=0,percussion=0,lastPass=0,closePassPlays=0,lastWave=0,wavePlays=0;
 function start(){if(ctx){ctx.resume();return;}ctx=new AudioContext();master=ctx.createGain();master.gain.value=0;
  const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=12;limiter.ratio.value=4;master.connect(limiter);limiter.connect(ctx.destination);
  // Category gain sits after authored envelopes, including opening and defeat.
  // Changing a preference cannot restart a transient or be overwritten by it.
  for(const [name,[key,fallback]]of channels){const bus=ctx.createGain();bus.gain.value=settings[key]??fallback;bus.connect(master);buses[name]=bus;}
  function voice(type,hz,gain){const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),level=ctx.createGain();osc.type=type;osc.frequency.value=hz;filter.type='lowpass';filter.frequency.value=320;level.gain.value=gain;osc.connect(filter);filter.connect(level);osc.start();return {osc,filter,level};}
  cart=voice('triangle',62,.2);mower=voice('sawtooth',34,0);blade=voice('sawtooth',153,0);pan=ctx.createStereoPanner();cart.level.connect(buses.effects);mower.level.connect(pan);blade.level.connect(pan);pan.connect(buses.mower);
  drone=voice('sine',43.65,0);harmonic=voice('sine',44.3,0);pulse=voice('sine',58,0);courseAmbience=createCourseAmbienceAudio(ctx,drone,buses.ambience);pulse.level.connect(buses.danger);alarmPan=ctx.createStereoPanner();harmonic.level.connect(alarmPan);alarmPan.connect(buses.danger);
  const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);let seed=7919,low=0;
  for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;low=low*.97+((seed>>>0)/2147483648-1)*.03;data[i]=low*3;}
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),level=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='bandpass';filter.frequency.value=380;filter.Q.value=.65;level.gain.value=0;source.connect(filter);filter.connect(level);level.connect(buses.ambience);source.start();wind={source,filter,level};
  thump=voice('sine',96,0);thump.filter.frequency.value=240;impactPan=ctx.createStereoPanner();thump.level.connect(impactPan);impactPan.connect(buses.effects);
  const metal=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.5),ctx.sampleRate),samples=metal.getChannelData(0);for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;samples[i]=((seed>>>0)/2147483648-1)*.65;}
  const clang=ctx.createBufferSource(),resonator=ctx.createBiquadFilter(),strike=ctx.createGain();clang.buffer=metal;clang.loop=true;resonator.type='bandpass';resonator.frequency.value=1100;resonator.Q.value=1.6;strike.gain.value=0;clang.connect(resonator);resonator.connect(strike);strike.connect(impactPan);clang.start();crash={source:clang,filter:resonator,level:strike};
  score=createChaseScore(ctx,master);
  footsteps=createRunnerFootstepAudio(ctx,cart);
  damageAudio=createCartDamageAudio(ctx,{cart,crash,thump,impactPan});
  runoverAudio=createRunoverAudio(ctx,{cart,mower,blade,pan,drone,harmonic,pulse,wind,thump,crash,impactPan});
 }
 function update(run,active){if(!ctx)return;const now=ctx.currentTime,c=chaseActor(run),ears=listenerYaw(run),j=run.joe,placement=mowerSoundPlacement(run,spatial),d=placement.distance,proximity=placement.proximity,running=active&&!muted&&!settings.muted,t=run.tension||{},panic=panicPose(run),fear=Math.max(t.intensity||0,panic.level*.85)*(encounterQuiet(run)&&d>16?.45:1),ram=ramWindup(run),commit=commitmentPose(run),wave=pressurePose(run),rev=Math.max(t.windup||0,ram.charge,commit.load*.9),surge=t.surge||0;
  mix();const atmospherePose=atmosphere.update(run),approachPose=approach.update(run);approachLevel=running?approachPose.level:0;
  score.update(run,running,settings);damageAudio.begin(run,running);footsteps.begin(run,running&&(settings.effectsVolume??1)>0);
  if(run.death){courseAmbience.reset();mixerTarget(master.gain,running?(settings.volume??volume)*.24:0,now,.06);runoverAudio.update(run,running);panicLevel=0;percussion=0;rumbleLevel=0;lastTime=run.time;return;}
  runoverAudio.release();const damageBusy=damageAudio.ownsStrike(run);
  panicLevel=running?panic.level:0;percussion=running?panic.percussion:0;
  if(lastRun!==run){lastRun=run;coolingTick=-1;rollingAudio=false;lastImpact=0;lastFX=0;lastLaunch=0;lastPanic=0;lastPass=0;lastWave=0;lastTime=run.time;beat=0;lastLatch=!!run.finale?.latched;}const impact=run.impact;
  if(impact&&impact.serial!==lastImpact){lastImpact=impact.serial;if((running||run.mode==='caught'&&!muted)&&impact.age<.3){impactPlays++;crash.filter.frequency.cancelScheduledValues(now);crash.filter.Q.cancelScheduledValues(now);crash.filter.frequency.setValueAtTime(1100,now);crash.filter.Q.setValueAtTime(1.6,now);const power=impact.strength,bearing=Math.atan2(impact.x-c.x,impact.y-c.y)-ears;impactPan.pan.setValueAtTime(Math.sin(bearing)*.8,now);
   thump.osc.frequency.cancelScheduledValues(now);thump.osc.frequency.setValueAtTime(impact.damaged?82+power*20:105+power*28,now);thump.osc.frequency.exponentialRampToValueAtTime(impact.damaged?31:39,now+.26);
   for(const[v,gain,end]of [[thump,.65+power*.65,impact.damaged?.43:.34],[crash,.35+power*.65,.24]]){v.level.gain.cancelScheduledValues(now);v.level.gain.setValueAtTime(.0001,now);v.level.gain.linearRampToValueAtTime(gain,now+.004);v.level.gain.exponentialRampToValueAtTime(.0001,now+end);v.level.gain.setValueAtTime(0,now+end+.02);}
   if(impact.damaged&&(!run.foot||run.cart.health<=0&&run.time-(run.cart.failedAt??-99)<.3))damageAudio.crunch(power,run.cart.health);
  }}
  const fx=run.courseFX?.cue,fxPriorityAge=fx?.kind==='gate'?99:(fx?.age??99);
  const gateCanSound=fx?.kind!=='gate'||!(j.ram.phase==='lineup'||j.ram.release>0||j.ram.footCharge>0||['signal','commit_warning','lane_commit','close_pass'].includes(run.hunt?.phase));
  if(fx&&fx.serial!==lastFX){lastFX=fx.serial;if(running&&!damageBusy&&gateCanSound&&fx.age<.3&&(impact?.age??99)>.4&&run.mode==='driving'){
   const range=Math.hypot(fx.x-c.x,fx.y-c.y),gain=Math.max(0,1-range/75)*fx.power*(fx.kind==='timber'?1.1:fx.kind==='metal'?.9:.19);
   if(gain>0){coursePlays++;damageAudio.release();if(fx.kind==='timber'||fx.kind==='metal'){thump.osc.frequency.cancelScheduledValues(now);thump.osc.frequency.setValueAtTime(135,now);thump.osc.frequency.exponentialRampToValueAtTime(52,now+.18);thump.level.gain.cancelScheduledValues(now);thump.level.gain.setValueAtTime(gain*.65,now);thump.level.gain.exponentialRampToValueAtTime(.0001,now+.3);thump.level.gain.setValueAtTime(0,now+.32);}impactPan.pan.setValueAtTime(Math.sin(Math.atan2(fx.x-c.x,fx.y-c.y)-ears)*.9,now);
    crash.filter.frequency.setValueAtTime(fx.kind==='gate'?420:fx.kind==='timber'?780:1600,now);crash.filter.Q.setValueAtTime(fx.kind==='gate'?3:fx.kind==='timber'?1.6:.6,now);
    crash.level.gain.cancelScheduledValues(now);crash.level.gain.setValueAtTime(gain,now);crash.level.gain.exponentialRampToValueAtTime(.0001,now+(fx.kind==='gate'?.32:fx.kind==='timber'?.38:.7));crash.level.gain.setValueAtTime(0,now+.75);
   }
  }}
  if((j.ram?.launches||0)!==lastLaunch){lastLaunch=j.ram.launches;if(running&&!damageBusy&&j.ram.release>0&&(impact?.age??99)>.4&&fxPriorityAge>.3&&run.mode==='driving'){
   ramLaunchPlays++;damageAudio.release();impactPan.pan.setValueAtTime(Math.sin(Math.atan2(j.x-c.x,j.y-c.y)-ears)*.85,now);crash.filter.frequency.setValueAtTime(920,now);crash.filter.Q.setValueAtTime(1.8,now);crash.level.gain.cancelScheduledValues(now);crash.level.gain.setValueAtTime(proximity*.4,now);crash.level.gain.exponentialRampToValueAtTime(.0001,now+.22);crash.level.gain.setValueAtTime(0,now+.25);
  }}
  // One directional mechanical strike marks the reveal release. Reuse the
  // existing noise voice, yielding to impact, timber and ram-clutch envelopes.
  if((run.panic?.serial||0)!==lastPanic){lastPanic=run.panic.serial;if(running&&!damageBusy&&run.panic.phase==='panic'&&run.panic.age<.25&&j.ram?.phase==='none'&&!(j.ram?.release>0)&&(impact?.age??99)>.4&&fxPriorityAge>.4){
   panicPlays++;damageAudio.release();impactPan.pan.setValueAtTime(Math.sin(Math.atan2(j.x-c.x,j.y-c.y)-ears)*.85,now);crash.filter.frequency.setValueAtTime(540,now);crash.filter.Q.setValueAtTime(.9,now);crash.level.gain.cancelScheduledValues(now);crash.level.gain.setValueAtTime(.0001,now);crash.level.gain.linearRampToValueAtTime(proximity*.32,now+.025);crash.level.gain.exponentialRampToValueAtTime(.0001,now+.38);crash.level.gain.setValueAtTime(0,now+.4);
  }}
  // A passing scrape is earned by the actual mower crossing alongside, never
  // played by a timer or a teleported visual. Reuse the existing noise voice.
  if((run.hunt?.commit?.passes||0)!==lastPass){lastPass=run.hunt?.commit?.passes||0;if(running&&!damageBusy&&commit.release>0&&(impact?.age??99)>.4&&fxPriorityAge>.4){closePassPlays++;damageAudio.release();impactPan.pan.setValueAtTime(Math.sin(Math.atan2(j.x-c.x,j.y-c.y)-ears)*.9,now);crash.filter.frequency.setValueAtTime(1700,now);crash.filter.Q.setValueAtTime(.7,now);crash.level.gain.cancelScheduledValues(now);crash.level.gain.setValueAtTime(.28,now);crash.level.gain.exponentialRampToValueAtTime(.0001,now+.55);crash.level.gain.setValueAtTime(0,now+.58);}}
  // Later waves reuse the strike voice and yield to nearby physical events.
  if((run.pressure?.waves||0)!==lastWave){lastWave=run.pressure?.waves||0;if(lastWave>1&&running&&!damageBusy&&!panic.reveal&&wave.release>0&&j.ram.phase==='none'&&!(j.ram.release>0)&&(impact?.age??99)>.6&&fxPriorityAge>.8&&!(commit.release>0)){wavePlays++;damageAudio.release();impactPan.pan.setValueAtTime(Math.sin(Math.atan2(j.x-c.x,j.y-c.y)-ears)*.85,now);crash.filter.frequency.setValueAtTime(470,now);crash.filter.Q.setValueAtTime(.8,now);crash.level.gain.cancelScheduledValues(now);crash.level.gain.setValueAtTime(.0001,now);crash.level.gain.linearRampToValueAtTime(proximity*.38,now+.025);crash.level.gain.exponentialRampToValueAtTime(.0001,now+.4);crash.level.gain.setValueAtTime(0,now+.43);}}
  const finale=run.finale||{},closing=run.mode==='sealing'&&!finale.latched,tail=run.mode==='complete',occluded=placement.occluded,flanking=j.ram?.phase==='backoff'||['signal','flank','commit_warning'].includes(run.hunt?.phase);
  if(closing){damageAudio.release();impactPan.pan.setTargetAtTime(0,now,.05);crash.filter.frequency.setTargetAtTime(620,now,.1);crash.filter.Q.setTargetAtTime(1.6,now,.1);crash.level.gain.setTargetAtTime(running?.09*(.65+.35*Math.sin(run.time*38)):0,now,.018);}
  if(finale.latched&&!lastLatch){lastLatch=true;if(running){latchPlays++;damageAudio.release();thump.osc.frequency.setValueAtTime(74,now);thump.osc.frequency.exponentialRampToValueAtTime(34,now+.25);for(const v of [thump,crash]){v.level.gain.cancelScheduledValues(now);v.level.gain.setValueAtTime(.65,now);v.level.gain.exponentialRampToValueAtTime(.0001,now+.35);v.level.gain.setValueAtTime(0,now+.4);}}}
  const dt=lastTime===null?0:Math.max(0,Math.min(.1,run.time-lastTime));lastTime=run.time;if(active)beat=(beat+dt*(.95+fear*.9+panic.percussion*.7+panic.finalPush*.25))%1;
  const rumble=cartRumble(run);rumbleLevel=running&&run.mode==='driving'?rumble.intensity:0;
  mixerTarget(master.gain,running?(settings.volume??volume)*.24*(tail?Math.min(1,(finale.tail||0)/2):1):0,now,.1);if(!run.foot){cart.osc.frequency.setTargetAtTime(53+Math.abs(c.speed)*5+rumble.detune,now,.025);cart.level.gain.setTargetAtTime(run.mode==='sealing'||tail?0:(.11+Math.abs(c.speed)*.009)*(1+rumbleLevel*.75*rumble.chatter)*rumble.mechanics.engineGain,now,.025);cart.filter.frequency.setTargetAtTime(320+rumbleLevel*700,now,.06);}
  const bladeCut=tail&&(finale.tail||0)<4,sideApproach=run.hunt?.kind==='alongside'&&['signal','alongside'].includes(run.hunt?.phase);
  motorMix=experienceMotor(run);const motor=motorMix*(run.grace>0?.18:(t.motorGain??1)*ram.motor*panic.motor*(commit.warning?.6+commit.load*.5:1)),chug=.82+.1*Math.sin(run.time*(23+Math.abs(j.speed)))+.08*Math.sin(run.time*11.7);
  mower.osc.frequency.setTargetAtTime(31+Math.abs(j.speed)*2.3+rev*40+ram.load*22+ram.pulse*6+surge*15+panic.level*12+panic.finalPush*9+approachLevel*(14+Math.sin(run.time*31)*3)+(flanking?12:0)+(sideApproach?Math.sin(run.time*8)*7:0),now,.1);mower.level.gain.setTargetAtTime(proximity*.46*motor*chug*(1+approachLevel*.65)*(occluded?.8:1),now,.1);mower.filter.frequency.setTargetAtTime((110+proximity*600+rev*240+approachLevel*600)*(occluded||finale.latched?.35:1),now,.15);
  // Mechanical emphasis belongs to the source: a surge or recent impact
  // must not leave a phantom blade audible after Joe is out of earshot.
  blade.osc.frequency.setTargetAtTime(130+Math.abs(j.speed)*7+run.lastImpact*100+surge*45+ram.load*160+approachLevel*80,now,.08);blade.level.gain.setTargetAtTime((proximity*.10+(run.lastImpact*.25+surge*.035+approachLevel*.065)*Math.min(1,proximity*2))*motor*(ram.active?.08+ram.load*.7:flanking?.15:1)*(bladeCut?0:1),now,.06);
  blade.filter.frequency.setTargetAtTime((260+proximity*540+ram.load*300+approachLevel*420)*(occluded||finale.latched?.4:1),now,.12);
  spatial.engineHz=31+Math.abs(j.speed)*2.3+rev*40;pan.pan.setTargetAtTime(placement.pan,now,.1);
  const quiet=atmospherePose.ambientGain*(1-approachLevel*.22)*wave.gain*(finale.latched?0:1)*(t.phase==='breather'?.2:1-(t.silence||0)*.78)*(ram.active?.5:1)*(panic.reveal?.22:1),sting=t.sting||0;
  courseAmbience.update(run,running,(.035+fear*.06+atmospherePose.rumble*.075)*quiet,43.65+rev*3-atmospherePose.rumble*9);
  const servicing=run.service?.active>=0&&running&&d>16&&!ram.active;
  alarmPan.pan.setTargetAtTime(0,now,.05);
  harmonic.filter.frequency.setTargetAtTime(servicing?480:320,now,.03);
  harmonic.osc.frequency.setTargetAtTime(servicing?110:sting>.05?287+sting*61:44.3+fear*1.7-atmospherePose.rumble*8.5,now,.22);
  harmonic.level.gain.setTargetAtTime(servicing?.035:(.025+fear*.03+sting*.055+atmospherePose.rumble*.035)*quiet,now,.15);
  const heartbeat=Math.exp(-(((beat-.08)/.045)**2))+.6*Math.exp(-(((beat-.27)/.055)**2));
  const kick=Math.exp(-beat*18),rhythm=panic.percussion*(.19*kick+.055*Math.exp(-(((beat-.5)/.055)**2)));
  pulse.level.gain.setTargetAtTime(finale.latched?0:fear*heartbeat*.22*wave.gain*(panic.reveal?.15:1)+rhythm,now,.015);pulse.osc.frequency.setTargetAtTime(54+fear*8+panic.percussion*kick*19,now,.025);
  const rattle=rumbleLevel*clampSpeed(c.speed)*Math.pow(Math.max(0,Math.sin(run.time*31)*Math.sin(run.time*47)),8);
  wind.filter.frequency.setTargetAtTime(330+fear*420+Math.sin(run.time*.17)*70-atmospherePose.rumble*180+panic.level*500+wave.gasp*1500+rattle*1800,now,.04);wind.level.gain.setTargetAtTime((.1+(1-fear)*.08+atmospherePose.rumble*.10)*quiet+rumbleLevel*.14*rumble.chatter+panic.level*Math.min(1,Math.abs(c.speed)/12)*.08+wave.gasp*.16+rattle*.1+approachLevel*.035,now,.025);
  const silence=run.experience?.silence,missAge=run.time-(run.experience?.nearMiss.at??-99),rolling=run.tactics?.active>=0;
  if(running&&!damageBusy&&(impact?.age??99)>.7&&fxPriorityAge>.8&&!ram.active&&!closing){
   if(silence?.phase==='quiet'){
    const tick=Math.floor(silence.age/.85);if(tick!==coolingTick){coolingTick=tick;coolingPlays++;impactPan.pan.setValueAtTime(placement.pan,now);crash.filter.frequency.setValueAtTime(2300,now);crash.filter.Q.setValueAtTime(7,now);crash.level.gain.cancelScheduledValues(now);crash.level.gain.setValueAtTime(.018*proximity,now);crash.level.gain.exponentialRampToValueAtTime(.0001,now+.16);crash.level.gain.setValueAtTime(0,now+.18);}
   }else if(rolling){rollingAudio=true;const f=run.destruction.features['range-abandoned-cart'],range=Math.hypot(f.x-c.x,f.y-c.y);impactPan.pan.setTargetAtTime(Math.sin(Math.atan2(f.x-c.x,f.y-c.y)-ears)*.8,now,.05);crash.filter.frequency.setTargetAtTime(470,now,.1);crash.filter.Q.setTargetAtTime(1.2,now,.1);crash.level.gain.setTargetAtTime(Math.max(0,1-range/45)*.06*(.6+.4*Math.sin(run.time*32)**2),now,.025);}
   if(!rolling&&rollingAudio){crash.level.gain.setTargetAtTime(0,now,.05);rollingAudio=false;}
   if(missAge>=0&&missAge<.65){wind.filter.frequency.setTargetAtTime(1400,now,.015);wind.level.gain.setTargetAtTime(.25*Math.exp(-missAge*5),now,.015);}
  }
  damageAudio.update(run,running,!damageBusy&&!closing&&!tail&&(impact?.age??99)>.7&&fxPriorityAge>.85&&!(j.ram?.release>0)&&!(commit.release>0)&&!(wave.release>0)&&!(run.panic?.phase==='panic'&&run.panic.age<.5),rumble.mechanics);
 }
 function intro(index,active=true,preferences=settings){
  introPlaying=active;if(!ctx)return;courseAmbience.reset();mix(preferences);score.silence();const now=ctx.currentTime,running=active&&!muted&&!preferences.muted;
  const engine=[0,0,.035,.16,.29][index]||0,cartLevel=[0,.10,.08,.08,.15][index]||0;
  for(const v of [cart,mower,blade,drone,harmonic,pulse,wind,thump,crash])v.level.gain.cancelScheduledValues(now);
  mixerTarget(master.gain,running?(preferences.volume??volume)*.24:0,now,.09);
  const gains=[cartLevel,engine,engine*.16,.008,0,0,.09,0,0];
  [cart,mower,blade,drone,harmonic,pulse,wind,thump,crash].forEach((v,i)=>v.level.gain.setTargetAtTime(running?gains[i]:0,now,.12));
  cart.osc.frequency.setTargetAtTime(index===4?72:54,now,.3);mower.osc.frequency.setTargetAtTime([30,30,32,43,62][index],now,.4);
  mower.filter.frequency.setTargetAtTime(index>=3?430:160,now,.2);blade.osc.frequency.setTargetAtTime(170,now,.2);pan.pan.setTargetAtTime(.25,now,.2);wind.filter.frequency.setTargetAtTime(340,now,.15);
  if(running&&index!==introIndex){
   introIndex=index;crash.filter.frequency.setValueAtTime(index===0?850:530,now);crash.filter.Q.setValueAtTime(1.7,now);impactPan.pan.setValueAtTime(-.25,now);
   const amount=([.06,.08,.025,.045,.07][index]);
   for(const offset of [0,.18]){crash.level.gain.setValueAtTime(Math.max(.0001,amount*(offset?.55:1)),now+offset);crash.level.gain.exponentialRampToValueAtTime(.0001,now+offset+.12);}
   crash.level.gain.setValueAtTime(0,now+.32);
   if(index===1){cart.osc.frequency.setValueAtTime(27,now);cart.osc.frequency.linearRampToValueAtTime(58,now+.65);}
  }
  if(!active)introIndex=-1;
 }
 return {start,update,intro,presentRunner(run,events,active=false){footsteps?.present(run,events,active&&!muted&&!settings.muted&&(settings.effectsVolume??1)>0&&run.mode==='driving');},toggle(){muted=!muted;return muted;},stats:()=>({experience:{motorMix,coolingPlays,rollingAudio},courseAmbience:courseAmbience?.stats(),mix:Object.fromEntries(Object.entries(buses).map(([name,bus])=>[name,bus.gain.value])),atmosphere:{...atmosphere.stats()},spatial,voices:ctx?14:0,score:score?.stats(),introPlaying,introIndex,footsteps:footsteps?.stats(),cartDamage:damageAudio?.stats(),runOver:runoverAudio?.stats(),impactPlays,latchPlays,coursePlays,ramLaunchPlays,panicPlays,closePassPlays,wavePlays,panicLevel,percussion,approach:approachLevel,rumble:rumbleLevel,muted:muted||settings.muted===true,master:master?.gain.value??0,active:!!ctx}),stop(){score?.dispose();score=null;ctx?.close();ctx=null;}};
}
