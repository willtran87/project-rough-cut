import {GROUND_SLABS} from './final-cut-ground-layout.js';
import {groundHeight} from './final-cut-arrival-layout.js';
import {SWALE,SECTORS,inside,isCut} from './final-cut-course.js';

export function footstepSurface(run){
 const p=run.player;
 if(p.x>=14.25&&p.x<=21.75&&p.y>=-17.1&&p.y<=-16.5)return 'wet';
 if(groundHeight(p)>0||p.y>=-16&&p.y<=-12&&p.x>=-20&&p.x<=16||p.y>=-17.5&&p.y<=-12.5&&Math.abs(p.x)>=14&&Math.abs(p.x)<=22)return 'paving';
 let top=0,material='grass';
 for(const slab of GROUND_SLABS){const dx=p.x-slab.x,dy=p.y-slab.y,c=Math.cos(slab.yaw||0),s=Math.sin(slab.yaw||0);
  if(slab.top>top&&Math.abs(dx*c-dy*s)<=slab.w/2&&Math.abs(dx*s+dy*c)<=slab.d/2){top=slab.top;material=slab.material;}
 }
 if(material==='road')return 'road';
 if(material==='path')return 'paving';
 if(material==='gravel')return 'gravel';
 // Follow the east-to-west wetting front used by the visible swale soil.
 // A raised stone skirt has already taken precedence over the damp turf.
 if(inside(p,SWALE)&&run.water*14>7-(p.x-SWALE.x)+.8)return 'wet';
 if(SECTORS.some(s=>inside(p,s))&&!isCut(run,p))return 'rough';
 return 'turf';
}
export const FOOTSTEP_SOUNDS=Object.freeze({
 turf:{cutoff:240,gain:.045,duration:.085},rough:{cutoff:620,gain:.042,duration:.14},
 gravel:{cutoff:980,gain:.06,duration:.115},paving:{cutoff:1250,gain:.065,duration:.065},road:{cutoff:820,gain:.055,duration:.075},
 wet:{cutoff:1750,gain:.055,duration:.17}
});

// Reuse the existing noise voice. One contact per travelled stride; time spent
// pressing into a wall, looking, paused or muted cannot accumulate footsteps.
export function createFinalCutFootsteps(ctx,voice){
 let owner=null,walk=0,position=null,enabled=false,played=0,last=null;
 function silence(){const now=ctx.currentTime;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setValueAtTime(0,now);}
 function update(run,active,volume=1){
  const p=run.player,previous=walk,oldPosition=position;walk=p.walk;position={x:p.x,y:p.y};
  const available=active&&volume>0;
  if(owner!==run){owner=run;enabled=available;last=null;silence();return;}
  if(!available||!enabled){if(enabled)silence();enabled=available;return;}
  const stride=1.4;
  if(p.speed<.1||walk<=previous||walk-previous>.8||Math.hypot(p.x-oldPosition.x,p.y-oldPosition.y)>1||Math.floor(walk/stride)===Math.floor(previous/stride))return;
  const surface=footstepSurface(run),sound=FOOTSTEP_SOUNDS[surface],now=ctx.currentTime,foot=Math.floor(walk/stride)%2;
  const gain=sound.gain*volume*(p.crouch?.38:p.focus?.55:Math.min(1.1,.7+p.speed/20));
  voice.filter.frequency.setValueAtTime(sound.cutoff*(foot?1.04:.96),now);voice.filter.Q.setValueAtTime(.65,now);voice.pan.pan.setValueAtTime(foot?.08:-.08,now);
  const g=voice.gain.gain;g.cancelScheduledValues(now);g.setValueAtTime(.0001,now);g.linearRampToValueAtTime(gain,now+.005);
  if(surface==='wet'){g.exponentialRampToValueAtTime(gain*.2,now+.035);g.linearRampToValueAtTime(gain*.36,now+.065);}
  g.exponentialRampToValueAtTime(.0001,now+sound.duration);g.setValueAtTime(0,now+sound.duration+.01);
  played++;last={surface,foot,time:run.time,gain,cutoff:sound.cutoff,duration:sound.duration};
 }
 return {update,silence,stats:()=>({played,enabled,last})};
}
