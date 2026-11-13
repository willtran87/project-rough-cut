import {variationChoice} from './chase-variation.js';
import {COURSE_GHOSTS,GHOST_ROUTES,ghostRoutePose} from './chase-ghost-routes.js';
export {COURSE_GHOSTS} from './chase-ghost-routes.js';
import {createGhostJoe} from './ghost-joe.js';
import {terrainHeight} from './course-terrain.js';

// Familiar Level 1 groundskeepers, with the same muted palette on face and
// clothes. Two prepared models are reused across six sightings, never enemies.
export async function createCourseGhosts(scene){
 const ghosts=[createGhostJoe(scene,{muted:true}),createGhostJoe(scene,{muted:true})];
 await Promise.all(ghosts.map(g=>g.ready));let visible=[],owner=null,last=0,behaviors=[];
 return {update(run,actor,reduced=false){
  if(owner!==run){owner=run;last=run.time;behaviors=COURSE_GHOSTS.map((_,i)=>({clock:run.time+variationChoice(run,'ghost-offset',i,24),kind:i===1||i===3?'watch':i===(variationChoice(run,'guide-site')?5:2)?'guide':'patrol',phase:'walking',age:0,used:false}));}
  const dt=Math.max(0,Math.min(.1,run.time-last));last=run.time;
  const nearest=COURSE_GHOSTS.map((_,i)=>{const b=behaviors[i],previous=ghostRoutePose(i,b.clock),gap=Math.hypot(previous.x-actor.x,previous.y-actor.y);
   if(dt>0&&run.mode==='driving'&&!reduced){
    if(b.phase==='walking'&&!b.used&&b.kind!=='patrol'&&gap<18&&gap>5){b.phase='watching';b.age=0;b.used=true;}
    if(b.phase==='walking')b.clock+=dt;else{b.age+=dt;if(b.age>3.2)b.phase=b.kind==='guide'?'vanishing':'walking';}
   }
   const p=ghostRoutePose(i,reduced?0:b.clock);return {...p,i,b,d:Math.hypot(p.x-actor.x,p.y-actor.y)};}).filter(p=>p.d<65).sort((a,b)=>a.d-b.d).slice(0,2);visible=[];
  ghosts.forEach((g,i)=>{
   const p=nearest[i];if(!p){g.show(null,0);return;}
   const t=reduced?0:run.time;
   const walking=p.b.phase==='walking',vanish=p.b.phase==='vanishing'?Math.max(0,1-(p.b.age-3.2)/1.2):1;
   const fade=vanish*Math.min(1,(65-p.d)/14)*Math.min(1,Math.max(0,(p.d-3)/5))*.68;
   const guide=p.b.kind==='guide'&&!walking,target=guide?(p.i===2?{x:-25,y:350}:{x:-16.89,y:710}):actor;
   if(guide&&!reduced){p.b.heading??=p.yaw;const turn=Math.atan2(target.x-p.x,target.y-p.y)-p.b.heading;p.b.heading+=Math.atan2(Math.sin(turn),Math.cos(turn))*(1-Math.exp(-dt*2.8));p.yaw=p.b.heading;}
   const gaze=Math.atan2(target.x-p.x,target.y-p.y)-p.yaw;
   g.show({x:p.x,y:terrainHeight(p.x,p.y),z:-p.y,yaw:-p.yaw},fade,{time:t,phase:p.phase,walkWeight:reduced||!walking?0:.9,distance:p.travel,resolve:.2,bodyLean:reduced||!walking?0:.04,headNod:guide?-.13:0,torsoTurn:guide?Math.max(-.45,Math.min(.45,Math.atan2(Math.sin(gaze),Math.cos(gaze)))):0,sway:reduced||!walking?0:Math.sin(p.phase*Math.PI*2)*.013,headYaw:Math.max(-.4,Math.min(.4,Math.atan2(Math.sin(gaze),Math.cos(gaze))))});
   if(g.stats().visible)visible.push({site:p.i,x:p.x,y:p.y,yaw:p.yaw,speed:reduced||!walking?0:p.speed,travel:p.travel,alpha:fade,behavior:p.b.kind,phase:p.b.phase});
  });
 },stats:()=>({ready:ghosts.every(g=>g.stats().ready),errors:ghosts.map(g=>g.stats().error).filter(Boolean),capacity:2,sites:COURSE_GHOSTS.length,visible,palette:'muted-green',headMatchesBody:true,routeLengths:GHOST_ROUTES.map(r=>r.length)}),
 warm(){ghosts.forEach((g,i)=>g.show({x:i*2,y:0,z:-10,yaw:0},.6,{walkWeight:.6,phase:.2}));},
 dispose(){ghosts.forEach(g=>g.dispose());}};
}
