import {RIG,MOVEMENT,lineClear} from './final-cut-course.js';
import {middleCoverWarning} from './final-cut-crossings.js';
import {selectGameplayMessage} from './message-presentation.js';
import {announcementCaption} from './final-cut-announcement.js';
import {ambushTell,wetFooting,AMBUSH} from './final-cut-ambush.js';

// Only predict the already committed straight pass. This is presentation data,
// not a new pursuit, collision or capture rule. Include the player's radius,
// the current slow stance and a 550ms reaction allowance. Never assume sprint.
export function cutWarningSeconds(r,side=0){
 const speed=r.player.focus?MOVEMENT.listen:r.player.crouch?MOVEMENT.crouch:MOVEMENT.walk;
 return Math.max(2,(Math.max(0,RIG.halfWidth+.3-Math.abs(side))+.2)/speed+.55);
}
export function approachingCut(r){
 const j=r.rig,p=r.player;
 if(r.mode!=='playing'||r.won||j.phase!=='pass'||j.deployment<=.98)return false;
 const dx=p.x-j.x,dy=p.y-j.y,s=Math.sin(j.yaw),c=Math.cos(j.yaw);
 const forward=dx*s+dy*c,side=dx*c-dy*s;
 return forward>-(RIG.halfLength+.3)&&forward<RIG.halfLength+.3+(j.attack?AMBUSH.cutSpeed:RIG.speed)*cutWarningSeconds(r,side)&&
  Math.abs(side)<RIG.halfWidth+.3&&lineClear(p,j);
}

export function finalCutMessages(r,preferences){
 const urgent=approachingCut(r),message=selectGameplayMessage([
  {kind:'danger',priority:100,text:urgent?'Cutting pass approaching. Move off the cutting strip.':''},
  {kind:'warning',priority:95,text:ambushTell(r)?`Reeds shaking to the ${r.rig.attack.entry}. Move across his approach, toward stone.`:''},
  {kind:'warning',priority:80,text:middleCoverWarning(r)?'Middle rough is next. Leave the strip before the reels reach it; use the dry bank.':''},
  {kind:'event',priority:60,text:r.messageTime>0?r.message:''},
  {kind:'warning',priority:55,text:wetFooting(r)?'Saturated turf slows your feet. Get back onto the dry bank.':''},
 ]);
 return {urgent,caption:message?.text||'',kind:message?.kind||'',
  dialogue:!urgent&&preferences.subtitles?(r.dialogueTime>0?r.dialogue:announcementCaption(r)):''};
}
