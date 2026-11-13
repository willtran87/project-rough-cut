import {rigHit,rigParts,worldPart} from './final-cut-rig.js';

// Transient visual history belongs to a run, never a save or the renderer.
// Record actual simulation substeps so a skipped presentation cannot leave a
// gap in the plants. Staging travel deliberately produces no advance warning.
const histories=new WeakMap();
export const PLANT_RECOVERY_SECONDS=3.6;
const pose=j=>({x:j.x,y:j.y,yaw:j.yaw,phase:j.phase,deployment:j.deployment,steering:j.steering||0});
export function recordPlantTravel(r,before){
 if(before.phase!=='pass'&&r.rig.phase!=='pass')return;
 let h=histories.get(r);if(!h){h={serial:0,steps:[]};histories.set(r,h);}
 const from=pose(before),to=pose(r.rig);
 // A phase boundary can finish a pass; retain its physical deployed pose.
 if(to.phase!=='pass'){to.phase=from.phase;to.deployment=from.deployment;}
 h.steps.push({id:++h.serial,time:r.time,from,to});
 while(h.steps.length&&(r.time-h.steps[0].time>PLANT_RECOVERY_SECONDS||h.steps.length>512))h.steps.shift();
}
export function plantRecovery(age){return age<0||age>=PLANT_RECOVERY_SECONDS?0:Math.exp(-age*1.35)*(.88+.12*Math.cos(age*7))*(1-age/PLANT_RECOVERY_SECONDS);}
export function createPlantContacts(plants,onChange){
 const cells=new Map(),size=2;
 plants.forEach((p,index)=>{const key=Math.floor(p.x/size)+','+Math.floor(p.y/size);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(index);});
 let owner=null,serial=0,contacts=0;const last=new Map(),pending=new Map();
 function touch(j,time){
  if(j.phase!=='pass')return;
  const partCenters=new Map();
  for(let y=Math.floor((j.y-6)/size);y<=Math.floor((j.y+6)/size);y++)for(let x=Math.floor((j.x-6)/size);x<=Math.floor((j.x+6)/size);x++)for(const index of cells.get(x+','+y)||[]){
   const p=plants[index],hit=rigHit(p,j,.14);if(!hit)continue;
   if(!partCenters.has(hit.id)){const part=rigParts(j).find(q=>q.id===hit.id);partCenters.set(hit.id,worldPart(j,part));}
   const center=partCenters.get(hit.id),dx=p.x-center.x+Math.sin(j.yaw)*.55,dy=p.y-center.y+Math.cos(j.yaw)*.55,length=Math.hypot(dx,dy)||1;
   const value={x:dx/length,z:-dy/length,time,part:hit.id};last.set(index,value);pending.set(index,value);contacts++;
  }
 }
 return {
  update(r){
   if(owner!==r){for(const index of last.keys())onChange(index,{x:0,z:0,time:-1000});last.clear();owner=r;serial=0;contacts=0;touch(pose(r.rig),r.time);}
   const h=histories.get(r);
   for(const step of h?.steps||[]){if(step.id<=serial)continue;serial=step.id;if(r.time-step.time>PLANT_RECOVERY_SECONDS)continue;
    const distance=Math.hypot(step.to.x-step.from.x,step.to.y-step.from.y),angle=Math.atan2(Math.sin(step.to.yaw-step.from.yaw),Math.cos(step.to.yaw-step.from.yaw));
    // Translation and turning are sampled at much finer spacing than a stem.
    const count=Math.max(1,Math.ceil((distance+Math.abs(angle)*5.4)/.12));
    for(let k=1;k<=count;k++){const t=k/count;touch({...step.to,x:step.from.x+(step.to.x-step.from.x)*t,y:step.from.y+(step.to.y-step.from.y)*t,yaw:step.from.yaw+angle*t},step.time);}
   }
   for(const [index,value]of pending)onChange(index,value);pending.clear();
  },
  stats(r){return {contacts,active:[...last.values()].filter(p=>plantRecovery(r.time-p.time)>.001).length,historySamples:histories.get(r)?.steps.length||0,collisionSource:'rigParts',recoverySeconds:PLANT_RECOVERY_SECONDS};},
  sample(index,time){const p=last.get(index);return p?{...p,strength:plantRecovery(time-p.time)}:null;}
 };
}

// Identical analytic response for color and depth shaders, with rooted bases.
export const plantContactGLSL=`
 attribute vec3 plantHit;
 float plantRecovery(float age){
  return age<0.0||age>=3.6?0.0:exp(-age*1.35)*(.88+.12*cos(age*7.0))*(1.0-age/3.6);
 }
`;
