import {chaseActor} from './chase-player.js';
import {JOE_STORY_CUES} from './back-nine-dialogue.js';
import {COURSE,distance,clamp} from './back-nine-course.js';

export const CREW_LOGS=[
 {title:'The last groundskeeper',text:'“Joe signed the night order: unfinished work carries over. Our names were still on his backlog. Order 041 is pinned under every shelter. Reed, Bell, Ward. Three cards punched in; not one punched out. I left the service charger live. If the mower starts, do not take the fairway.”'},
 {title:'The empty clubhouse',text:'“The members went home at dusk. The range rack has one card left. The garage rack has none. The same order is still open. Joe said leaving was not an acceptance criterion. Those lights are on a timer. Bring both relay circuits online; the service shutter will still close from inside.”'}
];
export const CHASE_BRIEF='Your cart has 100 health. Hard rams cause more damage; relays and service chargers repair it. Joe keeps hunting. The clubhouse service shutter has no power. Drive through the two amber-lit relay shelters to reconnect it, then park inside the garage and hold the brake. The staff carts are abandoned. Joe has taken the industrial mower. At each shelter, you may stop and hold the brake for a crew log and up to 25 extra repair over 3.5 seconds. Release the brake to leave early with the repair already earned. Joe keeps moving. After a missed attack, use the opening to reach cover or a narrow gap. Only Joe can smash timber and maintenance supplies. Your wrecked cart will not stop him. No checkpoints: failure restarts the entire run.';
export function chaseBrief(run){return run.checkpoint===0?CHASE_BRIEF:run.checkpoint===1?'The maintenance relay is already online. Reach the night-range relay shelter to restore the garage shutter. Optional: stop under a shelter and hold the brake for a crew log and gradual repair. Release early to keep what you earned. Break his line of sight behind course buildings and windbreaks.':'Both relays are online. The garage has power. Drive around the clubhouse to its service entrance, park fully inside and hold the brake. The shutter will close behind you. Joe is still on the course.';}
export const speedMph=speed=>Math.round(Math.abs(speed)*2.2369362921);
export function district(y){return y<330?'THE MAINTENANCE YARD':y<620?'THE FLOODED NIGHT RANGE':'THE EMPTY CLUBHOUSE';}
export function createCourseStory(collected=0,checkpoint=0){return {collected:collected&3,near:-1,hold:0,seen:(1<<checkpoint)-1,choiceSeen:0,cue:'',cueTime:0};}
export function updateCourseStory(run,input,dt){
 const s=run.story,c=chaseActor(run);s.cueTime=Math.max(0,s.cueTime-dt);
 for(const [i,d]of COURSE.decisions.entries())if(!(s.choiceSeen&(1<<i))&&c.y>d.entry.y-14&&c.y<d.gate.y){s.choiceSeen|=1<<i;s.cue=d.cue;s.cueTime=6;}
 const zone=c.y<330?0:c.y<620?1:2;
 if(c.y>65&&!(s.seen&(1<<zone))){s.seen|=1<<zone;s.cue=JOE_STORY_CUES[zone];s.cueTime=6;}
 s.near=run.mode==='driving'?COURSE.checkpoints.findIndex((p,i)=>!(s.collected&(1<<i))&&distance(c,p)<4.5):-1;
 if(s.near<0||!input.brake||Math.abs(c.speed)>.7){s.hold=0;return;}
 s.hold=clamp(s.hold+dt,0,1.1);if(s.hold<1.1)return;
 const index=s.near;s.collected|=1<<index;s.near=-1;s.hold=0;
 s.cue=`Crew log recovered · ${run.foot?'the cart cannot be recovered':run.cart.health<100?'the charger is optional':'cart already sound'}. Read it when paused.`;s.cueTime=7;
 run.events.push({type:'crew-log',index,time:run.time});
}
export function storyCaption(run){const s=run.story;if(!s||distance(chaseActor(run),run.joe)<18)return '';
 if(s.near>=0&&run.foot)return 'Optional · hold Use under the shelter to recover the crew log.';
 if(s.near>=0)return s.hold>0?`Hold brake · crew log ${Math.floor(s.hold/1.1*100)}%`:'Optional · stop under the shelter and hold brake for a crew log.';
 return s.cueTime>0?s.cue:'';
}
export function journalText(run){return CREW_LOGS.filter((_,i)=>run.story.collected&(1<<i)).map(l=>l.title+'\n'+l.text).join('\n\n');}
