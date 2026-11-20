import {rigSurfaceDistance} from './final-cut-feedback.js';
import {refuge,MOVEMENT,clamp,isCut} from './final-cut-course.js';
import {markFound,foundIn} from './run-records.js';

// Presentation glue for the final round's "feel": screen tension, heartbeat,
// flashes, camera shake, the near-miss beat, Joe's horn, a flushed bird and the
// discovery list. It reads the run after each simulation step and never writes
// to it, so replays and saves cannot see any of this.

// The chapter's grade, applied over LOOKS.finalCut: floodlit turf against a
// cold night. Shadows lean teal, lamps lean warm; nothing is made darker.
export const FINAL_CUT_LOOK=Object.freeze({shadowTint:[.95,1.0,1.05],highTint:[1.08,1.01,.9],saturation:1.1,contrast:1.04,vignette:.2,grain:.026,bloom:.5,threshold:.68});

// Optional things to find or do. Ids are stored by run-records.js.
export const DISCOVERIES=Object.freeze(['record','breaker','bell-trap','ball-redirect','bird','both-hollows-first-try','route-garage','route-drain','route-direct','plan-0','plan-1','plan-2','records-filed','records-kept','hard']);
const ROOSTS=[{id:'west-near',x:-19,y:26},{id:'east-middle',x:19,y:50},{id:'west-far',x:-19,y:66}];
const SHAKES={mired:.7,victory:.9,'tear-free':.6,slip:.3,'break-prop':.55,'blocked-pass':.45,'manifold-rupture':.55,'rig-shutdown':.25};
export const CHAPTER='final-cut';

export function createFinalCutPolish({ambience=null,preferences={}}={}){
 const seen=new Set(),closeCalls=new Map(),flushed=new WeakMap();
 let owner=null,tension=0,phase=0,beatAge=9,flash=0,flashColor='#ffffff',shake=0,fov=0,slow=0,clock=0,armed=false,nearest=Infinity,shelter=null,shelterTime=0,caption='',captionUntil=0,birds=[],serial=-1,done=null;
 const stats={closeCalls:0,beats:0,horns:0,birds:0,slowdowns:0,lastReaction:null};
 const note=(text,seconds=3.5)=>{caption=text;captionUntil=clock+seconds;};
 function react(run,kind,pattern,text){
  const p=run.player,j=run.rig,yaw=p.yaw+p.rearAngle,dx=j.x-p.x,dy=j.y-p.y,d=Math.hypot(dx,dy);
  ambience?.horn(pattern,(dx*Math.cos(yaw)-dy*Math.sin(yaw))/Math.max(1,d),1/(1+d*.03));stats.horns++;stats.lastReaction=kind;note(text,4);
 }
 function discover(run){
  if(run.loadLimit)markFound(CHAPTER,'record');
  if(run.stats.ballRedirects>0)markFound(CHAPTER,'ball-redirect');
  if(run.completed){markFound(CHAPTER,'route-'+run.route);markFound(CHAPTER,'plan-'+run.seed);if(run.recordChoice)markFound(CHAPTER,'records-'+run.recordChoice);if(run.difficulty==='hard')markFound(CHAPTER,'hard');if(run.captures===0&&run.stats.slips===0)markFound(CHAPTER,'both-hollows-first-try');}
 }
 return {
  // dt is wall-clock seconds for this update (before any slow-down scaling).
  update(run,dt,{live=true,reduced=false,feel=true}={}){
   clock+=dt;
   if(owner!==run){owner=run;seen.clear();for(const e of run.events)seen.add(e);armed=false;nearest=Infinity;shelter=null;shelterTime=0;birds=flushed.get(run)||[];flushed.set(run,birds);phase=0;beatAge=9;serial=-1;}
   const p=run.player,j=run.rig,playing=live&&run.mode==='playing'&&!run.won,d=Math.hypot(j.x-p.x,j.y-p.y);
   // Tension: the drama model's pressure, or plain closeness of a working rig.
   const near=playing&&!['waiting','disabled','reveal'].includes(j.phase)?clamp(1-(d-4)/22,0,1)*(j.phase==='pass'?1:j.phase==='mired'?.25:.5):0,target=playing?Math.max(run.drama.pressure*.85,near):0;
   tension+=(target-tension)*Math.min(1,dt*(target>tension?3:1.2));
   // Heartbeat: audible and visible on the same beat.
   beatAge+=dt;
   if(playing&&tension>.4){phase+=dt*(1.15+1.3*tension);if(phase>=1){phase-=1;beatAge=0;stats.beats++;ambience?.beat((tension-.4)/.6);}}else phase=.6;
   // New simulation events.
   for(const e of run.events){if(seen.has(e))continue;seen.add(e);if(seen.size>96)seen.delete(seen.values().next().value);
    if(SHAKES[e.type]){const far=Math.hypot((e.x??j.x)-p.x,(e.y??j.y)-p.y);shake=Math.max(shake,SHAKES[e.type]/(1+far*.07));}
    if(e.type==='capture'){flash=.5;flashColor='#3a0703';armed=false;}
    else if(e.type==='blackout'){markFound(CHAPTER,'breaker');react(run,'blackout','long','A long blast on the horn answers the dark.');}
    else if(e.type==='bell'){if(run.lure?.trap)markFound(CHAPTER,'bell-trap');else react(run,'dry-bell','short','Joe answers the bell with one flat note. The swale is dry.');}
    else if(e.type==='phase'&&e.phase==='disengage'&&j.evidence==='golf ball')react(run,'fooled','double','Two sharp notes on the horn. He found only a golf ball.');
   }
   if(run.saveSerial!==serial||run.completed!==done){serial=run.saveSerial;done=run.completed;discover(run);}
   // Near miss: the working rig came inside 1.5 m and the player got clear.
   if(playing&&j.phase==='pass'){const gap=rigSurfaceDistance(p,j);nearest=Math.min(nearest,gap);if(gap<1.5)armed=true;
    if(armed&&gap>3.2){armed=false;nearest=Infinity;const id=run.runId,n=(closeCalls.get(id)||0)+1;closeCalls.set(id,n);stats.closeCalls=n;
     if(feel&&!reduced){flash=Math.max(flash,.14);flashColor='#dfe9ff';slow=.24;stats.slowdowns++;shake=Math.max(shake,.25);}}
   }else if(armed&&run.mode!=='caught'&&playing){armed=false;const id=run.runId,n=(closeCalls.get(id)||0)+1;closeCalls.set(id,n);stats.closeCalls=n;}
   else if(!playing)armed=false;
   // He notices a player who will not leave the stone.
   const here=playing&&run.arrival.open&&j.phase!=='pass'&&j.phase!=='mired'?refuge(p)?.id||null:null;
   if(here&&here===shelter){shelterTime+=dt;if(shelterTime>28){shelterTime=-45;react(run,'waiting','taps','Three slow taps on the horn. He can wait.');}}else{shelter=here;shelterTime=Math.min(shelterTime,0);}
   // A bird sits in each stand of uncut rough until someone runs through it.
   if(playing&&p.speed>MOVEMENT.walk*1.1)for(const roost of ROOSTS){if(birds.some(b=>b.id===roost.id)||Math.hypot(roost.x-p.x,roost.y-p.y)>4.5||isCut(run,roost))continue;
    birds.push({...roost});stats.birds++;markFound(CHAPTER,'bird');const yaw=p.yaw+p.rearAngle,dx=roost.x-p.x,dy=roost.y-p.y;ambience?.flutter((dx*Math.cos(yaw)-dy*Math.sin(yaw))/Math.max(1,Math.hypot(dx,dy)),1);note('A bird breaks from the rough.',3);}
   // Decays and camera additions.
   flash*=Math.exp(-dt*6.5);if(flash<.004)flash=0;shake*=Math.exp(-dt*4.5);if(shake<.01)shake=0;slow=Math.max(0,slow-dt);
   const sprint=playing&&!p.crouch&&!p.focus?clamp((p.speed-MOVEMENT.walk)/(MOVEMENT.sprint-MOVEMENT.walk),0,1):0;fov+=(sprint*3.2-fov)*Math.min(1,dt*5);
   stats.closeCalls=closeCalls.get(run.runId)||0;
  },
  frame(reduced=false,feel=true){
   const on=feel&&!reduced,t=clock;
   return {tension:feel?tension:0,pulse:on?clamp(beatAge<.5?Math.max(Math.exp(-beatAge*13),beatAge>.13?.7*Math.exp(-(beatAge-.13)*13):0)*Math.max(0,tension-.4)/.6*.55:0,0,1):0,flash:on?flash:0,flashColor,
    shake:on?shake:0,shakeX:Math.sin(t*61)*.6+Math.sin(t*37+1)*.4,shakeY:Math.sin(t*53+2)*.6+Math.sin(t*29)*.4,fov:on?fov:0,birds};
  },
  get timeScale(){return slow>0?.55:1;},
  get tension(){return tension;},
  closeCalls:run=>closeCalls.get(run.runId)||0,
  caption:()=>clock<captionUntil?caption:'',
  found:()=>foundIn(CHAPTER).filter(id=>DISCOVERIES.includes(id)).length,
  stats:()=>({...stats,tension:+tension.toFixed(3),flash:+flash.toFixed(3),shake:+shake.toFixed(3),fov:+fov.toFixed(2),slow:slow>0,caption:clock<captionUntil?caption:'',found:foundIn(CHAPTER).length}),
 };
}
