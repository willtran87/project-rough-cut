import {distance,lineClear,refuge,RIG,clamp} from './final-cut-course.js';
import {approachingCut} from './final-cut-messages.js';
import {JOE_LINES} from './final-cut-dialogue-lines.js';
const lines=new Map(JOE_LINES.map(line=>[line.id,line]));
export function createDrama(saved={}){saved=saved&&typeof saved==='object'?saved:{};return {heard:Array.isArray(saved.heard)?[...new Set(saved.heard.filter(id=>lines.has(id)))]:[],cooldown:Number.isFinite(saved.cooldown)?clamp(saved.cooldown,0,14):0,pending:null,active:null,phase:'arrival',pressure:0,quiet:0,lastRefuge:null};}
export const dramaSnapshot=r=>({heard:[...r.drama.heard],cooldown:r.drama.cooldown});
export function queueJoeLine(r,id){
 const line=lines.get(id),d=r.drama;if(!line||d.heard.includes(id))return false;
 if(d.pending&&lines.get(d.pending.id).priority>line.priority)return false;
 d.pending={id,expires:r.time+line.window};return true;
}
export function dramaticPhase(r){
 const j=r.rig,p=r.player;
 if(r.won)return r.ending.age<7?'collapse':r.ending.age<8.5?'shutdown':'safe';
 if(!r.arrival.requested)return 'arrival';
 if(!r.arrival.open)return 'demonstration';
 if(r.opening.silenceAt!==null&&r.time-r.opening.silenceAt<4)return 'silence';
 if(approachingCut(r))return 'committed';
 const sheltered=refuge(p),d=distance(j,p);
 if(sheltered)return j.phase==='pass'&&d<18?'close-pass':r.drama.quiet>0?'release':'refuge';
 const dx=p.x-j.x,dy=p.y-j.y,s=Math.sin(j.yaw),c=Math.cos(j.yaw),forward=dx*s+dy*c,side=dx*c-dy*s;
 if(j.phase==='pass'&&forward< -RIG.halfLength-.3&&Math.abs(side)<RIG.halfWidth+4)return 'window';
 if(j.phase==='announce'&&Math.abs(side)<RIG.halfWidth+.3&&lineClear(p,j))return 'approach';
 return 'exposed';
}
export function advanceDrama(r,dt){
 const d=r.drama;d.cooldown=Math.max(0,d.cooldown-dt);d.quiet=Math.max(0,d.quiet-dt);
 const shelter=refuge(r.player)?.id||null;
 if(shelter&&shelter!==d.lastRefuge&&r.arrival.open&&!r.won)d.quiet=3;
 d.lastRefuge=shelter;d.phase=dramaticPhase(r);
 const urgent=approachingCut(r),live=['playing','aftermath'].includes(r.mode);
 const target=({arrival:0,demonstration:.15,silence:0,committed:1,'close-pass':.18,release:0,refuge:0,window:.08,approach:.5,exposed:.28,collapse:.3,shutdown:0,safe:0})[d.phase];
 d.pressure=clamp(d.pressure+clamp(target-d.pressure,-dt*.8,dt*1.6),0,1);
 if(d.active&&(!live||urgent||r.time-d.active.started>=d.active.duration)){d.active=null;r.dialogue='';r.dialogueTime=0;}
 if(!live){d.pending=null;return;}
 if(d.pending&&r.time>d.pending.expires)d.pending=null;
 if(!d.pending||urgent)return;
 const line=lines.get(d.pending.id);
 if(d.active&&line.priority<=lines.get(d.active.id).priority)return;
 if(!line.essential&&(d.cooldown>0||r.messageTime>0||r.ballAim.active||r.player.focus))return;
 const range=line.essential?70:lineClear(r.player,r.rig)?45:24;
 if(distance(r.player,r.rig)>range)return;
 d.pending=null;d.active={id:line.id,started:r.time,duration:line.duration+.25};d.heard.push(line.id);d.cooldown=14;r.saveSerial++;
 r.dialogue=`Joe: “${line.text}”`;r.dialogueTime=d.active.duration;
}
// Score supports actual exposure; it never changes threat selection or motion.
export function scoreFrame(r){
 const d=r.drama,phase=d.phase,focus=r.player.focus?.18:1;
 const music=({arrival:.008,demonstration:.012,silence:0,committed:.018,'close-pass':0,release:0,refuge:0,window:.003,approach:.013,exposed:.009,collapse:.018*Math.max(0,1-r.ending.age/7),shutdown:.01*Math.max(0,1-(r.ending.age-7)/1.5),safe:0})[phase]||0;
 const frequency=({arrival:82.41,demonstration:73.42,committed:55,window:73.42,approach:61.74,exposed:65.41,collapse:55,shutdown:82.41})[phase]||82.41;
 return {phase,music:music*focus,frequency,pulse:phase==='committed'?(Math.pow(Math.max(0,Math.sin(r.time*7)),3)*.055*d.pressure*focus):0,wind:phase==='release'||phase==='refuge'?.018:.04};
}
