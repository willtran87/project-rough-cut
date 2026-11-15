import {chaseActor} from './chase-player.js';
import {listenerYaw} from './runner-look.js';
import {ramWindup} from './ram-windup.js';

// The caption and stereo source use the same listener orientation and range.
// Stereo alone does not identify front/back or the mower's intended route.
export function mowerSoundPlacement(run,out={}){
 const actor=chaseActor(run),joe=run.joe,dx=joe.x-actor.x,dy=joe.y-actor.y;
 const distance=Math.hypot(dx,dy),pan=Math.sin(Math.atan2(dx,dy)-listenerYaw(run))*.85;
 out.distance=distance;out.pan=pan;out.proximity=Math.max(0,1-distance/70);out.occluded=!!run.hunt?.occluded;
 out.side=Math.abs(pan)>=.4?(pan<0?'to your left':'to your right'):'';
 return out;
}

export function mowerSoundCaption(run,placement=mowerSoundPlacement(run)){
 if(placement.proximity<=0)return '';
 const joe=run.joe,ram=ramWindup(run);
 let sound;
 if(run.grace>0)sound='Diesel engine turns over';
 else if(ram.active)sound={hush:'Mower engine drops to idle',rev:'Mower engine rises; cutting decks rattle',commit:'Mower engine surges; cutting decks drop'}[ram.stage];
 else if(run.hunt?.phase==='commit_warning')sound='Mower engine rises; cutting decks rattle';
 else if(run.panic?.phase==='reveal')sound=run.panic.age<.22?'Mower engine drops to a low rumble':'Mower engine rises sharply';
 else if(run.tension?.phase==='windup')sound='Mower engine climbs';
 else if(run.tension?.phase==='surge'||joe.ram?.footCharge>0||joe.ram?.release>0)sound='Mower engine roars; blades whine';
 else sound=Math.abs(joe.speed)<.6?'Mower idling':Math.abs(joe.speed)<6?'Mower engine chugging':'Mower engine roaring';
 const where=[placement.side,placement.occluded?'muffled beyond cover':placement.distance>42?'distant':placement.distance<16?'close':''].filter(Boolean).join(' · ');
 return `[${sound}${where?' · '+where:''}]`;
}
