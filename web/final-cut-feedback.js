import {rigParts,worldPart} from './final-cut-rig.js';
import {clamp} from './final-cut-course.js';

export const FEEDBACK_KEY='rough-cut.final-cut-feedback.v1';
export function feedbackPreferences(value={}){
 return Object.fromEntries(Object.entries({footsteps:.8,vibration:.35}).map(([key,fallback])=>[key,Number.isFinite(value[key])?clamp(value[key],0,1):fallback]));
}
export function rigSurfaceDistance(player,rig){
 let nearest=Infinity;
 for(const part of rigParts(rig)){const b=worldPart(rig,part),dx=player.x-b.x,dy=player.y-b.y,c=Math.cos(b.yaw),s=Math.sin(b.yaw);
  nearest=Math.min(nearest,Math.hypot(Math.max(0,Math.abs(dx*c-dy*s)-b.w/2),Math.max(0,Math.abs(dx*s+dy*c)-b.d/2)));
 }return nearest;
}
export function closePassFeedback(run){
 if(run.mode!=='playing'||run.won||run.rig.phase!=='pass')return null;
 const distance=rigSurfaceDistance(run.player,run.rig);if(distance>=5)return null;
 const force=1-distance/5;return {kind:'close-pass',duration:110,strongMagnitude:.2*force,weakMagnitude:.38*force,distance};
}
const impacts={'manifold-rupture':{duration:220,strongMagnitude:.3,weakMagnitude:.12},'rig-shutdown':{duration:160,strongMagnitude:.12,weakMagnitude:.2}};

// Bounded, supplementary dual-rumble effects. No queued timer, no mobile
// vibration, and no promise failure can interrupt movement or retry playback.
export function createFinalCutFeedback(clock=()=>performance.now()){
 let owner=null,actuator=null,until=0,next=0,playing=false;const seen=new Set(),failed=new WeakSet();
 const stats={supported:false,played:0,resets:0,failures:0,last:null};
 function stop(){if(playing&&actuator){stats.resets++;try{Promise.resolve(actuator.reset?.()).catch(()=>{});}catch{}}playing=false;until=next=0;}
 function update(run,pad,enabled,strength){
  const candidate=pad?.connected?pad.vibrationActuator:null;
  const supported=!!candidate&&typeof candidate.playEffect==='function'&&(!candidate.effects||Array.from(candidate.effects).includes('dual-rumble'))&&!failed.has(candidate);
  if(candidate!==actuator){stop();actuator=candidate;}
  stats.supported=supported;
  if(owner!==run){stop();owner=run;seen.clear();for(const e of run.events)seen.add(e);}
  let impact=null;
  for(const e of run.events){if(seen.has(e))continue;seen.add(e);if(seen.size>64)seen.delete(seen.values().next().value);
   if(impacts[e.type]&&run.time-e.time>=0&&run.time-e.time<.15){const distance=Math.hypot((e.x??run.rig.x)-run.player.x,(e.y??run.rig.y)-run.player.y);if(distance<35)impact={kind:e.type,...impacts[e.type],scale:1/(1+distance*.08)};}
  }
  const now=clock();if(now>=until)playing=false;
  if(!enabled||!supported||!['playing','aftermath'].includes(run.mode)||!(strength>0)){stop();return;}
  const effect=impact||closePassFeedback(run);if(!effect||!impact&&now<next)return;
  const scale=clamp(strength,0,1)*(effect.scale??1),params={duration:effect.duration,startDelay:0,strongMagnitude:effect.strongMagnitude*scale,weakMagnitude:effect.weakMagnitude*scale};
  const target=actuator;stats.played++;stats.last={kind:effect.kind,...params};playing=true;until=now+effect.duration;next=now+(impact?effect.duration:100);
  try{Promise.resolve(target.playEffect('dual-rumble',params)).catch(()=>{failed.add(target);stats.failures++;if(actuator===target)stop();});}catch{failed.add(target);stats.failures++;stop();}
 }
 return {update,stop,stats:()=>({...stats,active:playing})};
}
