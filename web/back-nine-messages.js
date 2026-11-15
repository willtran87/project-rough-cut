import {tacticCaption,exitCaption} from './chase-tactics.js';
import {experienceCaption} from './chase-experience.js';
import {shortcutCaption} from './chase-shortcuts.js';
import {courseAmbienceCaption} from './chase-course-ambience.js';
import {utilityCaption,utilityBell} from './chase-utility.js';
import {routeHint} from './chase-route-guidance.js';
import {chaseActor} from './chase-player.js';
import {insideGarage} from './chase-garage.js';
import {serviceCaption} from './chase-service.js';
import {distance} from './back-nine-course.js';
import {mowerSoundCaption} from './chase-machine-sound.js';
import {storyCaption} from './back-nine-story.js';
import {decoyCaption} from './back-nine-decoys.js';
import {backNineInstruction,backNineMovement} from './back-nine-opening.js';

const soundCues={
 'The fairway lights are losing power.':'[Fairway floodlights buzz and falter]',
 'Something rings out across the empty course.':'[A distant metallic ring across the course]',
 'The clubhouse lights are fading.':'[Clubhouse electrical hum fades]'
};

// Pick instructions explicitly. Ambient engine/lighting prose can never
// displace an interaction or objective update, even with sound captions on.
export function chaseMessages(run,{soundCaptions=false,routeHints=false,coarse=false,method=coarse?'touch':'keyboard',bindings}={}){
 const actor=chaseActor(run),gap=distance(actor,run.joe),struck=run.impact.age<1.1;
 let banner='',sound='',dialogue='';
 // Confirm the checkpoint first, then expose the limited-reserve choice while
 // the player is actually on its pad. Four seconds of notice hid the cost.
 const checkpointNotice=/^(?:Maintenance relay online|Both relays online)/.test(run.message);
 const showObjective=!checkpointNotice||run.utility?.near<0||run.utility?.near===undefined||run.messageTime>=3;
 if(run.mode==='dying'||run.mode==='caught')banner='Run down by Joe.';
 else if(run.foot?.ejection&&run.time-run.foot.ejection.at<.86)banner=run.time-run.foot.ejection.at<.64?'CART WRECKED':'CART WRECKED · Getting back up…';
 else if(run.foot&&run.foot.invulnerable>0)banner='CART WRECKED · RUN! '+backNineMovement(method,bindings)+' '+(run.checkpoint<2?'Relays still work on foot.':'Hold Use inside the garage.');
 else if(run.mode==='sealing')banner=run.finale.latched?'Shutter secured.':'Stay inside · shutter closing.';
 else if(run.finishHold>0)banner=run.foot?'Hold Use · securing the shutter.':'Hold the brake · parking inside.';
 else if(run.messageTime>0&&showObjective&&/^(?:Maintenance relay online|Both relays online|Checkpoint held|Brake, reverse|Crew log recovered|Hold drive to push|Keep moving into the loose rails)/.test(run.message))banner=run.message;
 else if(run.messageTime>0&&/^Watch your /.test(run.message))banner=run.message.split('.')[0]+' · take cover.';
 else if(run.messageTime>0&&/^He overshot/.test(run.message))banner='CHARGE MISSED · cross behind him and reach cover.';
 else if(run.messageTime>0&&/^(?:He saw you|He hears your footsteps|Your motor gives you away)/.test(run.message))banner='Distraction lost · move to fresh cover.';
 else if(exitCaption(run))banner=exitCaption(run);
 else if(run.tactics?.near>=0)banner=tacticCaption(run);
 else if(run.messageTime>0&&/^(?:Pressure released|Empty cart released|Distraction lost|Shutter freed)/.test(run.message))banner=run.message;
 else if(run.courseFX?.gateNear>=0)banner=shortcutCaption(run);
 else if(run.utility?.near>=0)banner=utilityCaption(run);
 else if(run.service?.near>=0&&(run.service.active>=0||gap>=18))banner=serviceCaption(run);
 else if(run.story?.near>=0&&gap>=18)banner=storyCaption(run);
 else if(run.decoys?.near>=0)banner=decoyCaption(run);
 else if(run.story?.cueTime>0&&run.story.cue.startsWith('Crew log recovered'))banner=run.story.cue;
 else if(run.messageTime>0&&run.decoys?.result==='failed'&&/alarm rings/i.test(run.message))banner='Distraction failed · keep moving.';
 else if(run.messageTime>0&&run.decoys?.active>=0)banner=run.foot?'Distraction active · move behind cover.':'Distraction active · coast behind cover below 12 mph.';
 else if(run.checkpoint===2&&insideGarage(actor,!!run.foot))banner=Math.abs(actor.speed)>=3?'Inside the garage · stop in the marked bay.':run.foot?'Hold Use · secure the shutter.':'Hold the brake · secure the shutter.';
 else if(run.checkpoint===2&&actor.y>730)banner=run.foot?'GARAGE AHEAD · run inside and hold Use.':'GARAGE AHEAD · park fully inside and hold the brake.';
 if(!banner)banner=experienceCaption(run);
 if(!banner&&routeHints&&gap>=18&&!struck)banner=routeHint(run);
 if(soundCaptions&&run.mode==='driving'){
 if(run.foot?.ejection&&run.time-run.foot.ejection.at>=.64&&run.time-run.foot.ejection.at<.86)sound='[Boots strike the ground]';
 else if(struck&&run.impact.damaged)sound='[Metal buckles; the cart jolts]';
 else if(run.joe.ram.phase==='lineup'||run.hunt?.phase==='commit_warning'||run.joe.ram.footCharge>0)sound=mowerSoundCaption(run);
 else if(run.courseFX?.cue.kind==='gate'&&run.courseFX.cue.age<.7&&distance(actor,run.courseFX.cue)<25)sound='[Gate latch clicks; hinges creak]';
 else if(run.courseFX?.cue.kind==='timber'&&run.courseFX.cue.age<.75&&distance(actor,run.courseFX.cue)<45)sound='[Timber splinters nearby]';
 else if(run.courseFX?.cue.kind==='metal'&&run.courseFX.cue.age<.75&&distance(actor,run.courseFX.cue)<45)sound='[Metal buckles under Joe’s mower]';
 else if(run.panic?.phase==='reveal')sound=mowerSoundCaption(run);
 else if(run.tension?.cueTime>0&&soundCues[run.tension.cue])sound=soundCues[run.tension.cue];
 else if(run.messageTime>0&&/^(?:Branches scrape|Timber cracks)/.test(run.message))sound='['+run.message+']';
 else sound=(gap>42?courseAmbienceCaption(run):'')||mowerSoundCaption(run);
 }
 // Steady engine/location descriptions share the separate accessibility rail
 // with occasional subtitles. Discrete contact/attack sounds still interrupt
 // optional dialogue, whether described or heard. Enabling descriptions must
 // not silence the story.
 const soundUrgent=run.mode==='driving'&&!!(
  !!run.foot?.ejection&&run.time-run.foot.ejection.at>=.64&&run.time-run.foot.ejection.at<.86||
  struck&&run.impact.damaged||gap<70&&(run.joe.ram.phase==='lineup'||run.hunt?.phase==='commit_warning'||run.joe.ram.footCharge>0||run.joe.ram.release>0||run.panic?.phase==='reveal')||
  run.courseFX?.cue.kind==='timber'&&run.courseFX.cue.age<.75&&distance(actor,run.courseFX.cue)<45||
  run.messageTime>0&&/^(?:Branches scrape|Timber cracks)/.test(run.message)
 );
 if(run.story?.cueTime>0&&run.story.cue.startsWith('JOE:'))dialogue=run.story.cue;
 return {banner:backNineInstruction(banner,method,bindings),sound:soundCaptions&&run.mode==='driving'?sound:'',dialogue,soundUrgent};
}
