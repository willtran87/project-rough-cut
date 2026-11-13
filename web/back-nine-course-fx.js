import {chaseActor} from './chase-player.js';
import {COURSE,distance,clamp} from './back-nine-course.js';
import {hullOverlap} from './vehicle-contact.js';
import {barrierFootprint,barrierBreakDirection} from './chase-barriers.js';

const barrierContacts=COURSE.hurdles.map(g=>{const shape=barrierFootprint(g);return {shape,range:Math.hypot(shape.rx,shape.ry)+4};});

// A fixed set of breakable maintenance hurdles, not a physics debris pool.
export function createCourseFX(){return {gateNear:-1,breaks:COURSE.hurdles.map(()=>({age:-1,direction:1,press:0,open:0,unlatched:false,swingDirection:-1,swingBlocked:false})),cue:{serial:0,age:99,kind:'brush',x:0,y:0,power:0},cooldown:0,hiddenCue:false};}
export function emitCourseCue(f,kind,p,power){f.cue={serial:f.cue.serial+1,age:0,kind,x:p.x,y:p.y,power};}
export function updateCourseFX(run,dt){
 const f=run.courseFX;f.cue.age+=dt;f.cooldown=Math.max(0,f.cooldown-dt);
 for(const [i,p]of COURSE.hurdles.entries()){
  const b=f.breaks[i];if(b.age>=0){b.age=Math.min(3,b.age+dt);continue;}
  // Player contact stops at intact rails; only Joe destroys them.
  // Joe must actually overlap a rail with his body or cutting deck; a near
  // miss of its center is neither necessary nor sufficient to break it.
  const vehicle=run.joe;
  const contact=barrierContacts[i];if(p.shortcut!==undefined)barrierFootprint(p,b,contact.shape);
  if(Math.abs(vehicle.speed)<=1||Math.abs(vehicle.x-contact.shape.x)>contact.range||Math.abs(vehicle.y-contact.shape.y)>contact.range||!hullOverlap(vehicle,'mower',contact.shape,'feature'))continue;
  b.age=0;b.direction=barrierBreakDirection(p,vehicle);
  emitCourseCue(f,'timber',p,clamp(Math.abs(vehicle.speed)/13,.3,1));f.cooldown=6;
  if(distance(p,chaseActor(run))<45&&run.messageTime<=0){run.message='Timber cracks across the fairway.';run.messageTime=2;}
 }
 if(!run.hunt.occluded)f.hiddenCue=false;
 if(run.mode!=='driving'||run.grace>0||run.tension.phase==='breather')return;
 if(run.hunt.occluded&&run.hunt.hiddenTime>1.2&&!f.hiddenCue&&f.cooldown===0&&run.joe.speed>4&&COURSE.sightbreaks.some(s=>Math.abs(s.x-run.joe.x)<12&&Math.abs(s.y-run.joe.y)<s.ry+6)){
  f.hiddenCue=true;f.cooldown=12;emitCourseCue(f,'brush',run.joe,.4);
  if(run.messageTime<=0){const side=Math.sin(Math.atan2(run.joe.x-chaseActor(run).x,run.joe.y-chaseActor(run).y)-chaseActor(run).yaw);run.message=`Branches scrape ${Math.abs(side)<.25?'behind the windbreak':side<0?'to your left':'to your right'}.`;run.messageTime=2.2;}
 }
}
